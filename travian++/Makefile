.PHONY: clean

../travian++.crx: ../travian++.pem farmlist.js manifest.json
	google-chrome --pack-extension=$(CURDIR) --pack-extension-key=../travian++.pem

../travian++.pem:
	google-chrome --pack-extension=$(CURDIR)

clean:
	rm -f ../travian++.crx ../travian++.pem
