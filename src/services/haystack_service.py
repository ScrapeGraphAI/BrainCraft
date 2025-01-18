from typing import List, Dict, Any
from haystack.document_stores import InMemoryDocumentStore
from haystack.nodes import EmbeddingRetriever
from haystack.pipelines import Pipeline
from haystack.schema import Document

class HaystackService:
    def __init__(self):
        # Initialize document store
        self.document_store = InMemoryDocumentStore(
            embedding_dim=384,  # Using mini-LM as default
            similarity="cosine"
        )
        
        # Initialize retriever
        self.retriever = EmbeddingRetriever(
            document_store=self.document_store,
            embedding_model="sentence-transformers/all-MiniLM-L6-v2",
            model_format="sentence_transformers"
        )
        
        # Initialize the pipeline
        self.pipeline = Pipeline()
        self.pipeline.add_node(component=self.retriever, name="Retriever", inputs=["Query"])

    def add_diagram(self, description: str, mermaid_code: str, metadata: Dict[str, Any] = None):
        """Add a diagram to the document store"""
        doc = Document(
            content=description,
            meta={
                "mermaid_code": mermaid_code,
                **(metadata or {})
            }
        )
        self.document_store.write_documents([doc])
        self.document_store.update_embeddings(self.retriever)

    def find_similar_diagrams(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Find similar diagrams based on description"""
        results = self.pipeline.run(query=query, params={"Retriever": {"top_k": top_k}})
        
        return [{
            "description": doc.content,
            "mermaid_code": doc.meta.get("mermaid_code"),
            "score": score
        } for doc, score in zip(results["documents"], results["scores"])]

    def process_feedback(self, diagram_id: str, feedback: str) -> Dict[str, Any]:
        """Process user feedback for diagram refinement"""
        # TODO: Implement feedback processing logic
        # This could involve:
        # 1. Understanding the feedback using a QA model
        # 2. Retrieving similar examples that address the feedback
        # 3. Generating refinement suggestions
        pass
