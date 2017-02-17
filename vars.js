const glob = require("glob");

// directory
const src = "src";
const dst = "build";

// JS
const src_ts = glob.sync(src + "/**/*.ts@(|x)");
const src_js = glob.sync(src + "/**/*.js");
const dst_js = [dst + "/matome_server.js", dst + "/static/matome_client.js"];

// CSS
const rejectUnderscore = (pathstr) => {
    for (let part of pathstr.split("/")) {
        if (part.length && part[0] === "_") {
            return false;
        }
    }
    return true;
};

const src_styl = glob.sync(src + "/**/*.styl");
const src_css = glob.sync(src + "/**/*.css");
const styl_re = new RegExp(`^${src}/(.+?)\.styl$`);
const dst_css = [...src_styl, ...src_css].filter(rejectUnderscore).map(s => s.replace(styl_re, `${dst}/$1.css`));

// generate vars.mk
const vars = {
    src: [src],
    dst: [dst],
    src_ts,
    src_js,
    dst_js,
    src_styl,
    src_css,
    dst_css
};

if (require.main === module) {
    for (let key in vars) {
        console.log(`${key.toUpperCase()} := ${vars[key].join(" ")}`);
    }
}

module.exports = vars;
