import os
import joblib
import logging
from pathlib import Path


class ModelLoader:
    """Singleton pattern untuk loading model ML sekali saja"""

    _instance = None
    _model = None
    _label_encoder = None
    _music_encoder = None
    _models_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Lazy loading - don't load models during initialization
        pass

    def _load_models(self):
        """Load semua model .pkl dari folder api/models/"""
        if self._models_loaded:
            return

        try:
            # Path ke folder models (relatif dari api/)
            models_path = Path(__file__).parent.parent / "models"

            logging.info(f"Loading models from: {models_path}")

            # Load main model dengan joblib
            model_path = models_path / "b4upload_model.pkl"
            self._model = joblib.load(model_path)
            logging.info("✅ Main model loaded successfully")

            # Load label encoder
            label_encoder_path = models_path / "label_encoder.pkl"
            self._label_encoder = joblib.load(label_encoder_path)
            logging.info("✅ Label encoder loaded successfully")

            # Load music encoder
            music_encoder_path = models_path / "music_encoder.pkl"
            self._music_encoder = joblib.load(music_encoder_path)
            logging.info("✅ Music encoder loaded successfully")

            self._models_loaded = True

        except Exception as e:
            logging.error(f"❌ Failed to load models: {e}")
            logging.error(f"Error type: {type(e).__name__}")
            # Don't raise - let it fail gracefully
            self._models_loaded = False

    def get_model(self):
        """Return main prediction model"""
        if not self._models_loaded:
            self._load_models()
        if self._model is None:
            raise RuntimeError("Model not initialized")
        return self._model

    def get_label_encoder(self):
        """Return label encoder"""
        if not self._models_loaded:
            self._load_models()
        if self._label_encoder is None:
            raise RuntimeError("Label encoder not initialized")
        return self._label_encoder

    def get_music_encoder(self):
        """Return music encoder"""
        if not self._models_loaded:
            self._load_models()
        if self._music_encoder is None:
            raise RuntimeError("Music encoder not initialized")
        return self._music_encoder

    def encode_music(self, music_title):
        """Encode music title dengan fallback handling"""
        if not self._models_loaded:
            self._load_models()
        try:
            # Coba encode music title
            return self._music_encoder.transform([music_title])[0]
        except (ValueError, KeyError):
            # Fallback ke "Original Sound" jika tidak dikenali
            try:
                logging.warning(f"Music '{music_title}' not found, using fallback")
                return self._music_encoder.transform(["Original Sound"])[0]
            except:
                # Ultimate fallback - return modus/default value
                logging.warning("Using default music encoding value")
                return 0  # atau nilai default lainnya

    def decode_prediction(self, prediction_array):
        """Decode numerical prediction ke label string"""
        if not self._models_loaded:
            self._load_models()
        return self._label_encoder.inverse_transform(prediction_array)


# Inisialisasi global model loader (tapi tidak load models yet)
model_loader = ModelLoader()
