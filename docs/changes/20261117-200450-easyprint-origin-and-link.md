### Added
- The setup wizard has an Allow EasyPrint switch under the allowed browser origins, on the advanced path. It adds `https://slicer.printables.com` to `core.api.allowed_origins`, so EasyPrint, the Prusa slicer on Printables, may call the server from a browser.
- The API credentials page in Settings has an Add this server to EasyPrint link. It opens EasyPrint on Printables with the address of the server, and EasyPrint then asks for a credential through the app pairing.
