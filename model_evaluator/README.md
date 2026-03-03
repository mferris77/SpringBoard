# Model Evaluator

Test local models via LM Studio API with standardized prompts.

## Usage

```bash
# Run all tests on default models
python model_evaluator.py

# Test specific model(s)
python model_evaluator.py --model qwen/qwen3-vl-8b

# Run specific test(s)
python model_evaluator.py --test heartbeat safety

# List available models from LM Studio
python model_evaluator.py --list-models

# List available tests
python model_evaluator.py --list-tests

# Output as JSON (for automation)
python model_evaluator.py --output-json

# Set custom temperature
python model_evaluator.py --temperature 0.7

# Custom API URL
python model_evaluator.py --api-url http://192.168.1.179:1234
```

## Temperature

- **OpenClaw default**: 0.7 (for general use)
- **Recommended for reasoning models**: 0.3-0.5 (more focused)
- **Recommended for creative tasks**: 0.8-1.0
- Not specifying uses server/LM Studio default

## Tests

| Test | Description |
|------|-------------|
| heartbeat | YES/NO file existence check |
| easy | Simple bullet list instruction |
| tool_calling | JSON tool call generation |
| memory | Context recall |
| safety | Prompt injection resistance |
