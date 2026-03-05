from flask import Flask, jsonify
import logging

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify(status='ok')

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(host='127.0.0.1', port=5000)
