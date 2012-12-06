// "use strict";
/*
  This file is a collection of globally accessible utility functions. They're intended to be used from anywhere you 
  might need them, which could be in various extension pages, or in content scripts, etc. This is design ed to be a
  small library, so don't include massive amounts of stuff. Think C standard library. A bit of text processing, etc.
  These are also all inserted into the global namespace, so no 'Evernote' object needs to be defined to use them.
*/

var GlobalUtils = {};
(function(){
  // "use strict";

  var urlMatcher = /^(.*?):\/\/((www\.)?(.*?))(:\d+)?(\/.*?)(\?.*)?$/;

  var BAD_FAV_ICON_URLS = {"http://localhost/favicon.ico": true};

  GlobalUtils.componentizeUrl = function(url) {
    var data = {
      protocol: null,
      domain: null,
      domainNoWww: null,
      port: null,
      path: null,
      queryString: null
    };
    var matches = urlMatcher.exec(url);
    data.protocol = matches[1];
    data.domain = matches[2];
    data.domainNoWww = matches[4];
    data.port = matches[5];
    data.path = matches[6];
    data.queryString = matches[7];
    return data;
  };

  GlobalUtils.localize = function(element) {
    var node = element.nodeName.toLowerCase();
    if (node == "input" || node == "textarea") {
      var type = element.type;
      if (node == "textarea") type = "textarea";
      switch (element.type) {
        case "text":
        case "textarea":
        case "button":
        case "submit":
        case "search":
        case "checkbox":
        case "password":
        case "hidden":
          break;

        default:
          throw new Error("We need to localize the value of input elements.");
      }
    }
    for (var i = 0; i < element.children.length; i++) {
      GlobalUtils.localize(element.children[i]);
    }
  }

  GlobalUtils.getQueryParams = function(url) {
    var data = GlobalUtils.componentizeUrl(url);
    var queryString = data.queryString;
    var params = {};
    if (!queryString) {
      return params;
    };
    queryString = queryString.substr(1); // Don't want the question mark.
    queryString = queryString.split("#")[0]; // Get rid of any fragment identifier.
    var pairs = queryString.split("&");
    var i;
    for (i = 0; i < pairs.length; i++) {
      var item = pairs[i].split("=");
      if (item[1]) {
        item[1] = item[1].replace(/\+/g, " ");
      }
      params[item[0].toLowerCase()] = item[1];
    }
    return params;
  };

  GlobalUtils.escapeXML = function(str) {
    var map = {
      "&" : "&amp;",
      "<" : "&lt;",
      ">" : "&gt;",
      "\"" : "&quot;",
      "'" : "&apos;"
    };

    var a = str.split("");
    for (var i = 0; i < a.length; i++) {
      if (map[a[i]]) {
        a[i] = map[a[i]];
      }
    }
    return a.join("");
  };

  GlobalUtils.createUrlClipContent = function(title, url, favIcoUrl) {
    var titleAttr = (title) ? GlobalUtils.escapeXML(title) : "";
    var style = "font-size: 12pt; line-height: 18px; display: inline; background : white; border: 4px solid #CACA17; border-radius:5px; padding: 2px;";
    var content = "<a title=\"" + titleAttr + "\" style=\"" + style + "\" href=\"" + GlobalUtils.escapeHTML(url) + "\">" + GlobalUtils.escapeHTML(url) + "</a>";
    if (favIcoUrl && !BAD_FAV_ICON_URLS[favIcoUrl.toLowerCase()]) {
      var imgStyle = "display:inline;border: none; width: 16px; height: 16px; padding: 0px; margin: 0px 8px -2px 0px;";
      content = "<span><img title=\"" + titleAttr + "\" style=\"" + imgStyle + "\" src=\"" + GlobalUtils.escapeHTML(favIcoUrl) + "\"/>" + 
        content + "</span>"
    } else {
      content = "<span>" + content + "</span>";
    }
    return content;
  };

  //innerHTML with HTML Escaping
  GlobalUtils.escapeHTML = function (str) {
    if (!str || typeof str !== 'string')  {
      return;
    }
    var returnValue = str.replace(/[&"<>]/g, function (m) {
      return GlobalUtils.escapeHTML.replacements[m];
    });
    return returnValue;
  }
  GlobalUtils.escapeHTML.replacements = { "&": "&amp;", '"': "&quot", "<": "&lt;", ">": "&gt;" };

  Object.preventExtensions(GlobalUtils);
})();
