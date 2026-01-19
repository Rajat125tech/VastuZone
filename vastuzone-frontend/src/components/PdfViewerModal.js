function PdfViewerModal({ fileUrl, onClose }) {
  if (!fileUrl) return null;

  return (
    <div className="pdf-modal-backdrop" onClick={onClose}>
      <div
        className="pdf-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pdf-modal-header">
          <h3>Floor Plan</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <iframe
          src={fileUrl}
          title="Floor Plan PDF"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}

export default PdfViewerModal;
