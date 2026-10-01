const mongoose = require('mongoose');

// One embedded piece of a question. The RAG pipeline searches these by vector similarity.
const knowledgeChunkSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    chunkIndex: { type: Number, default: 0 },
    text: { type: String, required: true },
    embedding: { type: [Number], select: false },
    embeddingModel: String,
    dims: Number,
    hash: { type: String, index: true },
    // Copied from the question so results can be filtered and shown without extra lookups.
    title: String,
    companies: [String],
    difficulty: String,
    topicTags: [String],
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ question: 1, chunkIndex: 1 }, { unique: true });

module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
