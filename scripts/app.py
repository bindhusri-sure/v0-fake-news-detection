"""
Fake News Detection - Streamlit Web Application
================================================
A simple web interface for classifying news articles as Fake or Real.

Usage:
    streamlit run app.py

Author: Fake News Detection Project
"""

import os
import re
import pickle
import streamlit as st

# NLP Libraries
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# =============================================================================
# CONFIGURATION
# =============================================================================

# Paths (relative to script location)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'model', 'best_model.pkl')
VECTORIZER_PATH = os.path.join(SCRIPT_DIR, 'model', 'tfidf_vectorizer.pkl')

# =============================================================================
# PAGE CONFIGURATION
# =============================================================================

st.set_page_config(
    page_title="Fake News Detector",
    page_icon="🔍",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# =============================================================================
# CUSTOM CSS
# =============================================================================

st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        color: #1E3A5F;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        text-align: center;
        color: #666;
        margin-bottom: 2rem;
    }
    .result-box {
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        margin: 1rem 0;
    }
    .result-real {
        background-color: #D4EDDA;
        border: 2px solid #28A745;
    }
    .result-fake {
        background-color: #F8D7DA;
        border: 2px solid #DC3545;
    }
    .result-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .result-prob {
        font-size: 1.2rem;
        color: #555;
    }
    .sample-box {
        background-color: #F8F9FA;
        padding: 1rem;
        border-radius: 8px;
        margin: 0.5rem 0;
        cursor: pointer;
    }
    .footer {
        text-align: center;
        color: #888;
        font-size: 0.9rem;
        margin-top: 3rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# NLTK SETUP
# =============================================================================

@st.cache_resource
def download_nltk_resources():
    """Download required NLTK resources."""
    resources = ['punkt', 'punkt_tab', 'stopwords', 'wordnet', 'omw-1.4']
    for resource in resources:
        try:
            nltk.download(resource, quiet=True)
        except Exception:
            pass

# =============================================================================
# MODEL LOADING
# =============================================================================

@st.cache_resource
def load_model_and_vectorizer():
    """
    Load the trained model and TF-IDF vectorizer.
    
    Returns:
        Tuple of (model, vectorizer) or (None, None) if loading fails
    """
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        
        with open(VECTORIZER_PATH, 'rb') as f:
            vectorizer = pickle.load(f)
        
        return model, vectorizer
    
    except FileNotFoundError:
        return None, None
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None, None

# =============================================================================
# TEXT PREPROCESSING
# =============================================================================

class TextPreprocessor:
    """Handles text preprocessing for prediction."""
    
    def __init__(self):
        """Initialize with NLTK components."""
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
    
    def clean_text(self, text: str) -> str:
        """
        Apply preprocessing steps to input text.
        
        Args:
            text: Raw input text
            
        Returns:
            Cleaned text ready for vectorization
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        
        # Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        
        # Remove punctuation and special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        cleaned_tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token not in self.stop_words and len(token) > 2
        ]
        
        return ' '.join(cleaned_tokens)

# =============================================================================
# PREDICTION FUNCTION
# =============================================================================

def predict_news(text: str, model, vectorizer, preprocessor) -> dict:
    """
    Predict whether news is fake or real.
    
    Args:
        text: Input news text
        model: Trained ML model
        vectorizer: Fitted TF-IDF vectorizer
        preprocessor: Text preprocessor instance
        
    Returns:
        Dictionary with prediction and probabilities
    """
    # Preprocess the text
    cleaned_text = preprocessor.clean_text(text)
    
    if not cleaned_text:
        return {
            'prediction': None,
            'label': 'Unable to process',
            'confidence': 0.0,
            'probabilities': {'Fake': 0.5, 'Real': 0.5}
        }
    
    # Vectorize
    text_tfidf = vectorizer.transform([cleaned_text])
    
    # Get prediction
    prediction = model.predict(text_tfidf)[0]
    
    # Get probabilities if available
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(text_tfidf)[0]
        prob_fake = probabilities[0]
        prob_real = probabilities[1]
    else:
        # For models without predict_proba
        prob_fake = 1.0 if prediction == 0 else 0.0
        prob_real = 1.0 if prediction == 1 else 0.0
    
    return {
        'prediction': prediction,
        'label': 'Real' if prediction == 1 else 'Fake',
        'confidence': max(prob_fake, prob_real),
        'probabilities': {
            'Fake': prob_fake,
            'Real': prob_real
        }
    }

# =============================================================================
# SAMPLE NEWS ARTICLES
# =============================================================================

SAMPLE_NEWS = {
    'real_1': {
        'title': '📰 Real News Example 1',
        'text': """The Federal Reserve announced today that it will maintain interest rates 
        at their current level, citing ongoing economic uncertainty. Chair Jerome Powell 
        stated that future rate decisions will depend on incoming data and the evolving 
        economic outlook. Markets responded positively to the announcement."""
    },
    'real_2': {
        'title': '📰 Real News Example 2',
        'text': """Scientists at NASA have successfully captured images of a distant galaxy 
        using the James Webb Space Telescope. The galaxy, located approximately 13 billion 
        light-years away, provides new insights into the early formation of the universe. 
        The research was published in the journal Nature Astronomy."""
    },
    'fake_1': {
        'title': '🚫 Fake News Example 1',
        'text': """BREAKING: Scientists confirm that the moon is actually made of cheese! 
        NASA has been hiding this truth for decades. Recent lunar samples brought back 
        by secret missions contain high levels of aged cheddar. The government is 
        expected to make an official announcement soon."""
    },
    'fake_2': {
        'title': '🚫 Fake News Example 2',
        'text': """SHOCKING DISCOVERY: Researchers have found that 5G towers are actually 
        mind control devices installed by the government. Leaked documents reveal a 
        secret program called Operation Mind Wave that uses electromagnetic signals 
        to control thoughts and behavior of citizens."""
    }
}

# =============================================================================
# MAIN APPLICATION
# =============================================================================

def main():
    """Main application function."""
    
    # Download NLTK resources
    download_nltk_resources()
    
    # Header
    st.markdown('<h1 class="main-header">🔍 Fake News Detector</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Analyze news articles using Machine Learning</p>', unsafe_allow_html=True)
    
    # Load model
    model, vectorizer = load_model_and_vectorizer()
    
    # Check if model is loaded
    if model is None or vectorizer is None:
        st.error("""
        ⚠️ **Model not found!**
        
        Please run the training script first:
        ```bash
        cd scripts
        pip install -r requirements.txt
        python train.py
        ```
        
        Then restart this app.
        """)
        return
    
    # Initialize preprocessor
    preprocessor = TextPreprocessor()
    
    # Model info
    with st.expander("ℹ️ About the Model"):
        st.markdown("""
        This application uses a Machine Learning model trained on news articles to detect fake news.
        
        **How it works:**
        1. Text is preprocessed (lowercasing, removing punctuation, stopwords, lemmatization)
        2. TF-IDF features are extracted from the text
        3. The trained classifier predicts whether the news is Fake or Real
        
        **Model Details:**
        - Feature Extraction: TF-IDF Vectorizer
        - Algorithm: Best performing model from Logistic Regression, Naive Bayes, Random Forest
        """)
    
    # Main input area
    st.markdown("### 📝 Enter News Article")
    
    news_text = st.text_area(
        "Paste the news article text here:",
        height=200,
        placeholder="Enter the news article you want to analyze...",
        key="news_input"
    )
    
    # Predict button
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        predict_button = st.button("🔍 Analyze", type="primary", use_container_width=True)
    
    # Show prediction
    if predict_button:
        if news_text.strip():
            with st.spinner("Analyzing..."):
                result = predict_news(news_text, model, vectorizer, preprocessor)
            
            if result['prediction'] is not None:
                # Display result
                if result['label'] == 'Real':
                    st.markdown(f"""
                    <div class="result-box result-real">
                        <div class="result-title" style="color: #28A745;">✅ REAL NEWS</div>
                        <div class="result-prob">Confidence: {result['confidence']*100:.1f}%</div>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div class="result-box result-fake">
                        <div class="result-title" style="color: #DC3545;">❌ FAKE NEWS</div>
                        <div class="result-prob">Confidence: {result['confidence']*100:.1f}%</div>
                    </div>
                    """, unsafe_allow_html=True)
                
                # Show probability breakdown
                st.markdown("#### 📊 Probability Breakdown")
                col1, col2 = st.columns(2)
                with col1:
                    st.metric("Fake Probability", f"{result['probabilities']['Fake']*100:.1f}%")
                with col2:
                    st.metric("Real Probability", f"{result['probabilities']['Real']*100:.1f}%")
                
                # Progress bars
                st.progress(result['probabilities']['Real'], text="Real")
            else:
                st.warning("⚠️ Could not process the text. Please try with different content.")
        else:
            st.warning("⚠️ Please enter some text to analyze.")
    
    # Sample news section
    st.markdown("---")
    st.markdown("### 📚 Try Sample Articles")
    st.markdown("Click on any sample to load it into the text area:")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**Real News Examples:**")
        if st.button("📰 Federal Reserve Announcement", key="real1"):
            st.session_state['sample_text'] = SAMPLE_NEWS['real_1']['text']
            st.rerun()
        if st.button("📰 NASA Space Discovery", key="real2"):
            st.session_state['sample_text'] = SAMPLE_NEWS['real_2']['text']
            st.rerun()
    
    with col2:
        st.markdown("**Fake News Examples:**")
        if st.button("🚫 Moon Made of Cheese", key="fake1"):
            st.session_state['sample_text'] = SAMPLE_NEWS['fake_1']['text']
            st.rerun()
        if st.button("🚫 5G Mind Control", key="fake2"):
            st.session_state['sample_text'] = SAMPLE_NEWS['fake_2']['text']
            st.rerun()
    
    # Handle sample text loading
    if 'sample_text' in st.session_state:
        st.info(f"📋 Sample loaded! Paste this text in the input area above:\n\n{st.session_state['sample_text']}")
        del st.session_state['sample_text']
    
    # Footer
    st.markdown("""
    <div class="footer">
        <p>🔬 Powered by Machine Learning | Built with Streamlit</p>
        <p>⚠️ <strong>Disclaimer:</strong> This tool provides predictions based on ML models and should not be used as the sole source for fact-checking.</p>
    </div>
    """, unsafe_allow_html=True)

# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    main()
