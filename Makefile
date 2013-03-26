.PHONY: all install clean

all: travian++.crx

travian++.crx: travian++.pem travian++/farmlist.js travian++/manifest.json
	google-chrome --pack-extension=travian++ --pack-extension-key=travian++.pem

travian++.pem:
	google-chrome --pack-extension=travian++

clean:
	rm -f travian++.crx

install:
	google-chrome --enable-easy-off-store-extension-install https://dl.dropbox.com/s/86e6c3tozd2op35/travian%2B%2B.crx?dl=1
