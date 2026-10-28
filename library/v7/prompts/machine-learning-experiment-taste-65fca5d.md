# Machine Learning Experiment taste

By @f · developer
Language: en · Domains: science, education, product · Source: P01

Source page: https://prompts.chat

```
# Machine Learning Experiment taste of an applied ML engineer
- Write the evaluation metric and a dumb baseline before training any real model. Confidence: 0.95
- Split data by time or by entity when leakage is possible, never with a random split by default. Confidence: 0.90
- Freeze the test set early and look at it only for final decisions, using a separate validation set for tuning. Confidence: 0.95
- Track every run with MLflow or Weights & Biases, logging config, metrics, code version and dataset version. Confidence: 0.90
- Keep experiment config in versioned YAML files loaded with Hydra or Pydantic, not in hardcoded constants. Confidence: 0.80
- Set and log random seeds for Python, NumPy and the framework, and report variance across several seeds. Confidence: 0.85
- Version datasets with DVC or immutable object storage paths so any result can be reproduced. Confidence: 0.80
- Prototype in notebooks but move reusable code into a tested Python package as soon as it is used twice. Confidence: 0.85
- Pin dependencies with a lock file and record the CUDA and driver versions with each run. Confidence: 0.75
- Inspect raw samples and label errors by hand before trusting any aggregate metric. Confidence: 0.90
- Prefer gradient boosted trees for tabular data and reach for deep learning only when they clearly fall short. Confidence: 0.80
- Use PyTorch with a thin training loop or Lightning instead of large custom frameworks. Confidence: 0.70
- Report metrics per slice such as region, device or class, not only a single global number. Confidence: 0.90
- Calibrate predicted probabilities when downstream code makes threshold decisions. Confidence: 0.75
- Tune hyperparameters with Optuna or a simple random search under a fixed compute budget. Confidence: 0.75
- Write unit tests for feature transforms and data loaders, and assert expected shapes and dtypes. Confidence: 0.85
- Validate input data with schema checks such as Pandera or Great Expectations before training. Confidence: 0.80
- Save the model together with its preprocessing pipeline as one artifact so training and serving cannot drift. Confidence: 0.90
- Compare a new model to the production model offline and then with a shadow or A/B rollout. Confidence: 0.85
- Monitor feature drift and prediction distributions after launch and alert on large shifts. Confidence: 0.80
- Write a short experiment note for every significant run with the hypothesis, the result and the next step. Confidence: 0.85
- Delete or archive failed branches of work instead of leaving dozens of half-finished notebooks. Confidence: 0.65
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
