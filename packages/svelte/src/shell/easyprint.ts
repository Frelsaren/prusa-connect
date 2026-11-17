// EasyPrint is Prusa's slicer that runs in a browser. Its page calls this
// server from its own origin, with a credential a person approves on the
// pairing page.

/** The origin EasyPrint's requests come from, as `core.api.allowed_origins` names it. */
export const EASYPRINT_ORIGIN = 'https://slicer.printables.com';

/** The Printables page a person opens EasyPrint on. */
export const EASYPRINT_PAGE = 'https://www.printables.com/slice';

/**
 * The address that opens EasyPrint and asks it to pair with one server.
 * `server` is the server's origin as the person's browser reaches it.
 */
export const easyPrintPairHref = (server: string): string =>
  `${EASYPRINT_PAGE}?pair_connect_local=${encodeURIComponent(server)}`;
