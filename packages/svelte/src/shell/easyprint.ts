// EasyPrint is Prusa's slicer that runs in a browser. Its page calls this
// server from its own origin, with a credential a person approves on the
// pairing page.

/** The origin EasyPrint's requests come from, as `core.api.allowed_origins` names it. */
export const EASYPRINT_ORIGIN = 'https://slicer.printables.com';
