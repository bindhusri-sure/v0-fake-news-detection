"""
Fake News Detection - Training Script
======================================
This script trains machine learning models to classify news as Fake (0) or Real (1).
It uses NLP preprocessing, TF-IDF vectorization, and multiple classifiers.

Author: Fake News Detection Project
"""

import os
import re
import pickle
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm

# NLP Libraries
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Machine Learning Libraries
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# =============================================================================
# CONFIGURATION
# =============================================================================

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'sample_data.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
FIGURES_DIR = os.path.join(os.path.dirname(__file__), 'figures')

# Create directories if they don't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(FIGURES_DIR, exist_ok=True)

# Random seed for reproducibility
RANDOM_STATE = 42

# =============================================================================
# NLTK SETUP
# =============================================================================

def download_nltk_resources():
    """Download required NLTK resources."""
    print("📥 Downloading NLTK resources...")
    resources = ['punkt', 'punkt_tab', 'stopwords', 'wordnet', 'omw-1.4']
    for resource in resources:
        try:
            nltk.download(resource, quiet=True)
        except Exception as e:
            print(f"Warning: Could not download {resource}: {e}")
    print("✅ NLTK resources ready!\n")

# =============================================================================
# DATA LOADING
# =============================================================================

def load_data(filepath: str) -> pd.DataFrame:
    """
    Load the dataset from a CSV file.
    
    Args:
        filepath: Path to the CSV file
        
    Returns:
        DataFrame containing the news data
    """
    print(f"📂 Loading data from: {filepath}")
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset not found at {filepath}")
    
    df = pd.read_csv(filepath)
    
    print(f"✅ Loaded {len(df)} samples")
    print(f"   Columns: {list(df.columns)}")
    print(f"   Label distribution:")
    print(f"   - Real (1): {(df['label'] == 1).sum()}")
    print(f"   - Fake (0): {(df['label'] == 0).sum()}\n")
    
    return df

# =============================================================================
# TEXT PREPROCESSING
# =============================================================================

class TextPreprocessor:
    """
    Handles all text preprocessing steps:
    - Lowercase conversion
    - Punctuation and special character removal
    - Stopword removal
    - Tokenization
    - Lemmatization
    """
    
    def __init__(self):
        """Initialize the preprocessor with NLTK components."""
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
    def clean_text(self, text: str) -> str:
        """
        Apply all preprocessing steps to a single text.
        
        Args:
            text: Raw text string
            
        Returns:
            Cleaned and preprocessed text
        """
        if pd.isna(text):
            return ""
        
        # Step 1: Convert to lowercase
        text = text.lower()
        
        # Step 2: Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        
        # Step 3: Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        
        # Step 4: Remove punctuation and special characters
        # Keep only letters and spaces
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Step 5: Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Step 6: Tokenization
        tokens = word_tokenize(text)
        
        # Step 7: Remove stopwords and apply lemmatization
        cleaned_tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token not in self.stop_words and len(token) > 2
        ]
        
        return ' '.join(cleaned_tokens)
    
    def preprocess_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess text in the dataframe.
        
        Args:
            df: DataFrame with 'title' and 'text' columns
            
        Returns:
            DataFrame with additional 'cleaned_text' column
        """
        print("🔧 Preprocessing text data...")
        
        # Combine title and text for better classification
        df['combined_text'] = df['title'].fillna('') + ' ' + df['text'].fillna('')
        
        # Apply cleaning with progress bar
        tqdm.pandas(desc="Cleaning text")
        df['cleaned_text'] = df['combined_text'].progress_apply(self.clean_text)
        
        # Remove empty texts
        initial_len = len(df)
        df = df[df['cleaned_text'].str.len() > 0]
        removed = initial_len - len(df)
        
        if removed > 0:
            print(f"⚠️  Removed {removed} samples with empty text after cleaning")
        
        print(f"✅ Preprocessing complete!\n")
        
        return df

# =============================================================================
# FEATURE ENGINEERING
# =============================================================================

def create_tfidf_features(X_train, X_test):
    """
    Create TF-IDF features from text data.
    
    TF-IDF (Term Frequency-Inverse Document Frequency) converts text to numerical features:
    - TF: How often a word appears in a document
    - IDF: How rare a word is across all documents
    - TF-IDF = TF * IDF (words that are frequent in one doc but rare overall get higher scores)
    
    Args:
        X_train: Training text data
        X_test: Testing text data
        
    Returns:
        Tuple of (vectorizer, X_train_tfidf, X_test_tfidf)
    """
    print("📊 Creating TF-IDF features...")
    
    vectorizer = TfidfVectorizer(
        max_features=5000,      # Limit vocabulary to top 5000 words by frequency
        min_df=2,               # Ignore words appearing in fewer than 2 documents
        max_df=0.95,            # Ignore words appearing in more than 95% of documents
        ngram_range=(1, 2),     # Include both unigrams and bigrams
        sublinear_tf=True       # Apply sublinear TF scaling (1 + log(tf))
    )
    
    # Fit on training data, transform both train and test
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    print(f"✅ TF-IDF features created!")
    print(f"   Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"   Training features shape: {X_train_tfidf.shape}")
    print(f"   Testing features shape: {X_test_tfidf.shape}\n")
    
    return vectorizer, X_train_tfidf, X_test_tfidf

# =============================================================================
# MODEL TRAINING
# =============================================================================

def train_models(X_train, y_train):
    """
    Train multiple classification models.
    
    Models:
    1. Logistic Regression: Linear model, good baseline for text classification
    2. Naive Bayes: Probabilistic model, works well with TF-IDF features
    3. Random Forest: Ensemble of decision trees, captures non-linear patterns
    
    Args:
        X_train: Training features (TF-IDF matrix)
        y_train: Training labels
        
    Returns:
        Dictionary of trained models
    """
    print("🤖 Training models...")
    
    models = {
        'Logistic Regression': LogisticRegression(
            max_iter=1000,          # Maximum iterations for convergence
            random_state=RANDOM_STATE,
            n_jobs=-1               # Use all CPU cores
        ),
        'Naive Bayes': MultinomialNB(
            alpha=0.1               # Additive smoothing parameter
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=100,       # Number of trees in the forest
            max_depth=20,           # Maximum depth of each tree
            random_state=RANDOM_STATE,
            n_jobs=-1               # Use all CPU cores
        )
    }
    
    trained_models = {}
    
    for name, model in models.items():
        print(f"   Training {name}...", end=" ")
        model.fit(X_train, y_train)
        trained_models[name] = model
        print("✅")
    
    print("\n✅ All models trained!\n")
    
    return trained_models

# =============================================================================
# MODEL EVALUATION
# =============================================================================

def evaluate_model(model, X_test, y_test, model_name: str) -> dict:
    """
    Evaluate a single model and return metrics.
    
    Args:
        model: Trained model
        X_test: Test features
        y_test: Test labels
        model_name: Name of the model
        
    Returns:
        Dictionary containing evaluation metrics
    """
    # Get predictions
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    metrics = {
        'model_name': model_name,
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, zero_division=0),
        'recall': recall_score(y_test, y_pred, zero_division=0),
        'f1_score': f1_score(y_test, y_pred, zero_division=0),
        'confusion_matrix': confusion_matrix(y_test, y_pred),
        'predictions': y_pred
    }
    
    return metrics

def evaluate_all_models(models: dict, X_test, y_test) -> list:
    """
    Evaluate all trained models.
    
    Args:
        models: Dictionary of trained models
        X_test: Test features
        y_test: Test labels
        
    Returns:
        List of evaluation results for each model
    """
    print("📈 Evaluating models...")
    print("=" * 60)
    
    results = []
    
    for name, model in models.items():
        metrics = evaluate_model(model, X_test, y_test, name)
        results.append(metrics)
        
        # Print detailed metrics
        print(f"\n📊 {name}")
        print("-" * 40)
        print(f"   Accuracy:  {metrics['accuracy']:.4f}")
        print(f"   Precision: {metrics['precision']:.4f}")
        print(f"   Recall:    {metrics['recall']:.4f}")
        print(f"   F1-Score:  {metrics['f1_score']:.4f}")
    
    print("\n" + "=" * 60)
    
    return results

# =============================================================================
# VISUALIZATION
# =============================================================================

def plot_confusion_matrices(results: list, y_test, save_path: str = None):
    """
    Plot confusion matrices for all models.
    
    Args:
        results: List of evaluation results
        y_test: True labels
        save_path: Path to save the figure
    """
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    
    for idx, result in enumerate(results):
        cm = result['confusion_matrix']
        
        sns.heatmap(
            cm,
            annot=True,
            fmt='d',
            cmap='Blues',
            xticklabels=['Fake', 'Real'],
            yticklabels=['Fake', 'Real'],
            ax=axes[idx]
        )
        
        axes[idx].set_title(f"{result['model_name']}\nF1: {result['f1_score']:.4f}")
        axes[idx].set_xlabel('Predicted')
        axes[idx].set_ylabel('Actual')
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"📊 Confusion matrices saved to: {save_path}")
    
    plt.close()

def plot_model_comparison(results: list, save_path: str = None):
    """
    Create a bar chart comparing model performance.
    
    Args:
        results: List of evaluation results
        save_path: Path to save the figure
    """
    # Prepare data for plotting
    model_names = [r['model_name'] for r in results]
    metrics_names = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
    
    data = {
        'Accuracy': [r['accuracy'] for r in results],
        'Precision': [r['precision'] for r in results],
        'Recall': [r['recall'] for r in results],
        'F1-Score': [r['f1_score'] for r in results]
    }
    
    x = np.arange(len(model_names))
    width = 0.2
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    for i, (metric_name, values) in enumerate(data.items()):
        bars = ax.bar(x + i * width, values, width, label=metric_name)
        # Add value labels on bars
        for bar, val in zip(bars, values):
            ax.annotate(f'{val:.3f}',
                       xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
                       xytext=(0, 3),
                       textcoords="offset points",
                       ha='center', va='bottom', fontsize=8)
    
    ax.set_xlabel('Models')
    ax.set_ylabel('Score')
    ax.set_title('Model Performance Comparison')
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels(model_names)
    ax.legend(loc='lower right')
    ax.set_ylim(0, 1.15)
    ax.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"📊 Model comparison chart saved to: {save_path}")
    
    plt.close()

# =============================================================================
# MODEL SELECTION AND SAVING
# =============================================================================

def select_best_model(results: list, models: dict):
    """
    Select the best model based on F1-score.
    
    Args:
        results: List of evaluation results
        models: Dictionary of trained models
        
    Returns:
        Tuple of (best_model_name, best_model, best_f1_score)
    """
    best_result = max(results, key=lambda x: x['f1_score'])
    best_name = best_result['model_name']
    best_model = models[best_name]
    best_f1 = best_result['f1_score']
    
    print(f"\n🏆 Best Model: {best_name}")
    print(f"   F1-Score: {best_f1:.4f}")
    
    return best_name, best_model, best_f1

def save_model_and_vectorizer(model, vectorizer, model_name: str, model_dir: str):
    """
    Save the trained model and vectorizer using pickle.
    
    Args:
        model: Trained model to save
        vectorizer: Fitted TF-IDF vectorizer
        model_name: Name of the model
        model_dir: Directory to save the files
    """
    print(f"\n💾 Saving model and vectorizer...")
    
    # Save model
    model_path = os.path.join(model_dir, 'best_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"   Model saved to: {model_path}")
    
    # Save vectorizer
    vectorizer_path = os.path.join(model_dir, 'tfidf_vectorizer.pkl')
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)
    print(f"   Vectorizer saved to: {vectorizer_path}")
    
    # Save model info
    info_path = os.path.join(model_dir, 'model_info.txt')
    with open(info_path, 'w') as f:
        f.write(f"Best Model: {model_name}\n")
        f.write(f"Model Type: {type(model).__name__}\n")
    print(f"   Model info saved to: {info_path}")
    
    print("\n✅ Model artifacts saved successfully!")

# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """Main execution function."""
    print("=" * 60)
    print("🔍 FAKE NEWS DETECTION - MODEL TRAINING")
    print("=" * 60 + "\n")
    
    # Step 1: Download NLTK resources
    download_nltk_resources()
    
    # Step 2: Load data
    df = load_data(DATA_PATH)
    
    # Step 3: Preprocess text
    preprocessor = TextPreprocessor()
    df = preprocessor.preprocess_dataframe(df)
    
    # Step 4: Split data
    print("📊 Splitting data into train and test sets...")
    X = df['cleaned_text']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,              # 20% for testing
        random_state=RANDOM_STATE,
        stratify=y                   # Maintain class distribution
    )
    
    print(f"   Training samples: {len(X_train)}")
    print(f"   Testing samples: {len(X_test)}\n")
    
    # Step 5: Create TF-IDF features
    vectorizer, X_train_tfidf, X_test_tfidf = create_tfidf_features(X_train, X_test)
    
    # Step 6: Train models
    models = train_models(X_train_tfidf, y_train)
    
    # Step 7: Evaluate models
    results = evaluate_all_models(models, X_test_tfidf, y_test)
    
    # Step 8: Visualize results
    plot_confusion_matrices(
        results, y_test,
        save_path=os.path.join(FIGURES_DIR, 'confusion_matrices.png')
    )
    
    plot_model_comparison(
        results,
        save_path=os.path.join(FIGURES_DIR, 'model_comparison.png')
    )
    
    # Step 9: Select and save best model
    best_name, best_model, best_f1 = select_best_model(results, models)
    save_model_and_vectorizer(best_model, vectorizer, best_name, MODEL_DIR)
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎉 TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\n📁 Output files:")
    print(f"   - {os.path.join(MODEL_DIR, 'best_model.pkl')}")
    print(f"   - {os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')}")
    print(f"   - {os.path.join(FIGURES_DIR, 'confusion_matrices.png')}")
    print(f"   - {os.path.join(FIGURES_DIR, 'model_comparison.png')}")
    print(f"\n🚀 Run the Streamlit app with:")
    print(f"   streamlit run app.py")
    print()

if __name__ == "__main__":
    main()
