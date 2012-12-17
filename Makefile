.PHONY: all install clean

all:
	$(MAKE) -C travian++

install:
	google-chrome --enable-easy-off-store-extension-install https://dl.dropbox.com/s/86e6c3tozd2op35/travian%2B%2B.crx?dl=1

clean:
	$(MAKE) -C travian++ clean
