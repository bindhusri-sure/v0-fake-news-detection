# 🔍 Fake News Detection

A complete end-to-end Machine Learning project for detecting fake news using NLP and Python.

## 📁 Project Structure

```
scripts/
├── data/
│   └── sample_data.csv      # Sample dataset (30 articles)
├── model/
│   ├── best_model.pkl       # Trained ML model (after training)
│   ├── tfidf_vectorizer.pkl # TF-IDF vectorizer (after training)
│   └── model_info.txt       # Model information
├── figures/
│   ├── confusion_matrices.png  # Confusion matrix visualizations
│   └── model_comparison.png    # Model performance comparison
├── train.py                 # Training script
├── app.py                   # Streamlit web application
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 2. Train the Model

```bash
python train.py
```

This will:
- Load and preprocess the dataset
- Train 3 ML models (Logistic Regression, Naive Bayes, Random Forest)
- Evaluate and compare models
- Save the best model and vectorizer
- Generate visualization plots

### 3. Run the Web App

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## 📊 Dataset Format

The dataset should be a CSV file with the following columns:

| Column | Description |
|--------|-------------|
| title  | News article headline |
| text   | Full news article text |
| label  | 0 = Fake, 1 = Real |

### Using Your Own Dataset

Replace `data/sample_data.csv` with your own dataset following the same format.

Popular datasets for fake news detection:
- [Kaggle Fake News Dataset](https://www.kaggle.com/c/fake-news/data)
- [LIAR Dataset](https://www.cs.ucsb.edu/~william/data/liar_dataset.zip)
- [FakeNewsNet](https://github.com/KaiDMML/FakeNewsNet)

## 🔧 Features

### Text Preprocessing
- Lowercase conversion
- URL removal
- HTML tag removal
- Punctuation removal
- Stopword removal (NLTK)
- Tokenization
- Lemmatization

### Feature Engineering
- TF-IDF Vectorization
- Unigrams and Bigrams
- Max 5000 features

### Models
1. **Logistic Regression** - Linear classifier, good baseline
2. **Naive Bayes** - Probabilistic, works well with text
3. **Random Forest** - Ensemble method, captures non-linear patterns

### Evaluation Metrics
- Accuracy
- Precision
- Recall
- F1-Score
- Confusion Matrix

## 🖥️ Web Application

The Streamlit app provides:
- Text input for news articles
- Real-time prediction
- Confidence scores
- Probability breakdown
- Sample articles for testing

## 📝 Sample Test Inputs

### Real News Example:
```
The Federal Reserve announced today that it will maintain interest rates 
at their current level, citing ongoing economic uncertainty. Chair Jerome 
Powell stated that future rate decisions will depend on incoming data.
```

### Fake News Example:
```
BREAKING: Scientists confirm that the moon is actually made of cheese! 
NASA has been hiding this truth for decades. Recent lunar samples contain 
high levels of aged cheddar.
```

## ⚙️ Configuration

You can modify these parameters in `train.py`:

```python
# TF-IDF Vectorizer
max_features=5000      # Vocabulary size
min_df=2               # Minimum document frequency
max_df=0.95           # Maximum document frequency
ngram_range=(1, 2)    # Include bigrams

# Train/Test Split
test_size=0.2         # 20% for testing

# Random Forest
n_estimators=100      # Number of trees
max_depth=20          # Max tree depth
```

## 📈 Expected Output

After running `train.py`:

```
============================================================
🔍 FAKE NEWS DETECTION - MODEL TRAINING
============================================================

📥 Downloading NLTK resources...
✅ NLTK resources ready!

📂 Loading data from: data/sample_data.csv
✅ Loaded 30 samples

🔧 Preprocessing text data...
✅ Preprocessing complete!

📊 Creating TF-IDF features...
✅ TF-IDF features created!

🤖 Training models...
   Training Logistic Regression... ✅
   Training Naive Bayes... ✅
   Training Random Forest... ✅

📈 Evaluating models...
============================================================

📊 Logistic Regression
----------------------------------------
   Accuracy:  0.8333
   Precision: 0.7500
   Recall:    1.0000
   F1-Score:  0.8571

...

🏆 Best Model: Logistic Regression
   F1-Score: 0.8571

💾 Saving model and vectorizer...
✅ Model artifacts saved successfully!
```

## 🤝 Contributing

Feel free to:
- Add more sophisticated models (BERT, LSTM)
- Improve preprocessing
- Add more evaluation metrics
- Enhance the web interface

## ⚠️ Disclaimer

This tool is for educational purposes. It should not be used as the sole source for fact-checking news articles. Always verify information from multiple reliable sources.

## 📜 License

MIT License - Feel free to use and modify for your projects!
