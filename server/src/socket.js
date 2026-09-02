let ioInstance = null;

function setSocketInstance(io) {
  ioInstance = io;
}

function emitMandateUpdate(mandateId) {
  if (ioInstance) {
    ioInstance.emit("mandate_updated", { mandateId });
  }
}

export { setSocketInstance, emitMandateUpdate };