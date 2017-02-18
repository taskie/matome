.PHONY: all clean clobber reload js css static

all: js css static

include vars.mk

clean:
	-rm -rf tmp/

clobber: clean
	-rm -rf build/

vars.mk: vars.js
	node $< > $@

reload: vars.mk
	$(MAKE) -B vars.mk

BIN := $(shell npm bin)

js: $(DST_JS)

css: $(DST_CSS)

$(DST_JS): $(SRC_TS) $(SRC_JS)
	@mkdir -p $(dir $@)
	$(BIN)/webpack --progress --colors --config webpack.config.server.js
	$(BIN)/webpack --progress --colors --config webpack.config.client.js

$(DST)/%.css: $(SRC)/%.styl
	$(BIN)/stylus $< -o $@

$(DST)/%.css: $(SRC)/%.css
	cp $< $@

server_test: all server_test_ssl
	@mkdir -p tmp
	rsync -rvP build/ tmp
	touch tmp/data.txt
	sh -c "cd tmp; node matome_server.js conf.json"

server_test_ssl: tmp/server.crt

tmp/server.key:
	openssl genrsa 2048 > $@

tmp/server.csr: tmp/server.key
	openssl req -new -sha256 -key $< -out $@

tmp/server.crt: tmp/server.csr
	openssl x509 -in $< -out $@ -req -signkey tmp/server.key -sha256 -days 3650
