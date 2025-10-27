// utils/word2vecSearch.js
const fs = require('fs');
const path = require('path');
const cosine = require('cosine-similarity');
const lineReader = require('line-reader');

const modelPath = path.join(__dirname, '../models/2vec.txt');
let wordVectors = {};
let vectorSize = 0;
let modelLoaded = false;

// 🔹 Nạp model 2vec.txt (chỉ đọc text)
async function loadWord2Vec() {
  if (modelLoaded) return; // tránh load lại nhiều lần
  return new Promise((resolve, reject) => {
    console.log('🔄 Loading 2vec model...');
    let lineCount = 0;

    lineReader.eachLine(modelPath, (line, last) => {
      const parts = line.trim().split(/\s+/);
      const word = parts.shift();
      const vector = parts.map(Number);
      if (!vectorSize) vectorSize = vector.length;
      wordVectors[word] = vector;
      lineCount++;

      if (last) {
        modelLoaded = true;
        console.log(`✅ Loaded ${lineCount} word vectors (${vectorSize} dims)`);
        resolve();
      }
    });
  });
}

// 🔹 Vector trung bình cho câu
function getSentenceVector(text = '') {
  if (!vectorSize || Object.keys(wordVectors).length === 0) return [];
  const words = text.toLowerCase().split(/\s+/);
  const vec = Array(vectorSize).fill(0);
  let count = 0;

  for (const w of words) {
    if (wordVectors[w]) {
      const v = wordVectors[w];
      for (let i = 0; i < vectorSize; i++) vec[i] += v[i];
      count++;
    }
  }
  if (count === 0) return vec;
  return vec.map(v => v / count);
}

// 🔹 Tính tương đồng cosine
function findSimilarProducts(query, products = []) {
  if (!vectorSize || Object.keys(wordVectors).length === 0) {
    console.error('❌ Model chưa được nạp!');
    return [];
  }

  const queryVec = getSentenceVector(query);
  const scored = products.map(p => {
    const prodVec = getSentenceVector(p.name || '');
    const score = cosine(queryVec, prodVec);
    return { ...p, similarity: score };
  });

  return scored.sort((a, b) => b.similarity - a.similarity);
}

module.exports = { loadWord2Vec, findSimilarProducts };
