// 'use strict';
Wiz.MozillaNativeController = function () {

    var WIZ_SAP_HKEY_CLASSES_ROOT = 0;
    var WIZ_SAP_HKEY_CURRENT_CONFIG = 1;
    var WIZ_SAP_HKEY_CURRENT_USER = 2;
    var WIZ_SAP_HKEY_LOCAL_MACHINE = 3;
    var WIZ_SAP_HKEY_USERS = 4;


    function wiz_km_getRegistryEntry(regRoot, regPath, regName) 
    {
        try 
        {
            if ("@mozilla.org/windows-registry-key;1" in Components.classes) 
            {
                // This works in Firefox 1.5
                var nsIWindowsRegKey = Components.classes["@mozilla.org/windows-registry-key;1"].getService(Components.interfaces.nsIWindowsRegKey);
                var regRootKey = new Array(0x80000000, 0x80000005, 0x80000001, 0x80000002, 0x80000003);
                nsIWindowsRegKey.open(regRootKey[regRoot], regPath, Components.interfaces.nsIWindowsRegKey.ACCESS_READ);
                if (nsIWindowsRegKey.valueCount)
                    return nsIWindowsRegKey.readStringValue(regName);
            }
            else if ("@mozilla.org/browser/shell-service;1" in Components.classes) 
            {
                // This works in Firefox 1.0.x
                var nsIWindowsShellService = Components.classes["@mozilla.org/browser/shell-service;1"].getService(Components.interfaces.nsIWindowsShellService);
                if (nsIWindowsShellService.getRegistryEntry)
                    return nsIWindowsShellService.getRegistryEntry(regRoot, regPath, regName);
            }
            else if ("@mozilla.org/winhooks;1" in Components.classes) 
            {
                // This works in Mozilla 1.7.x
                var nsIWindowsRegistry = Components.classes["@mozilla.org/winhooks;1"].getService(Components.interfaces.nsIWindowsRegistry);
                if (nsIWindowsRegistry.getRegistryEntry)
                    return nsIWindowsRegistry.getRegistryEntry(regRoot, regPath, regName);
            }
        } 
        catch(e) 
        {
            throw e;
        }
        return null;
    }

    function wiz_km_getWizAppPath() 
    {
        var regRoot = WIZ_SAP_HKEY_CURRENT_USER;
        var regPath = "SOFTWARE\\WizBrother\\Wiz";
        var regName = "AppPath";
        
        return wiz_km_getRegistryEntry(regRoot, regPath, regName);
    }


    function wiz_km_writeFileWithCharset(file, content, charset) 
    {
        try
        {
            if (file.exists() && file.isFile())
            {
                file.remove(false);
            }
            //
            const cc = Components.classes;
            const ci = Components.interfaces;
            const unicodeConverter = cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(ci.nsIScriptableUnicodeConverter);
            unicodeConverter.charset = charset;
            content = unicodeConverter.ConvertFromUnicode(content);
            const os = cc["@mozilla.org/network/file-output-stream;1"].createInstance(ci.nsIFileOutputStream);
            os.init(file, 0x02 | 0x08 | 0x20, -1, 0);
            os.write(content, content.length);
            os.close();
        }
        catch (err)
        {
            throw err;
        }
    }
    function wiz_km_unicodeToBytes(content, charset) 
    {
        try
        {
            const cc = Components.classes;
            const ci = Components.interfaces;
            const unicodeConverter = cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(ci.nsIScriptableUnicodeConverter);
            unicodeConverter.charset = charset;
            content = unicodeConverter.ConvertFromUnicode(content);
            //
            return content;
        }
        catch (err)
        {
            throw err;
        }
    }

    function wiz_km_runExeFile(fileExe, cmdline, block) 
    {
        try 
        {
            const proc = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
            proc.init(fileExe);
            proc.run(block, cmdline, cmdline.length);
        } 
        catch (err) 
        {
            throw err;
        }
    }

    var wiz_km_base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function wiz_km_base64Encode(str) 
    {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while(i < len) 
        {
            c1 = str.charCodeAt(i++) & 0xff;
            if(i == len)
            {
                out += wiz_km_base64EncodeChars.charAt(c1 >> 2);
                out += wiz_km_base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if(i == len)
            {
                out += wiz_km_base64EncodeChars.charAt(c1 >> 2);
                out += wiz_km_base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += wiz_km_base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += wiz_km_base64EncodeChars.charAt(c1 >> 2);
            out += wiz_km_base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += wiz_km_base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
            out += wiz_km_base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }

    function wiz_km_validateFileName(filename)
    {
        filename = filename.replace(/[\"\?!~`]+/g, "");
        filename = filename.replace(/[\*\&]+/g, "+");
        filename = filename.replace(/[\\\/\|\:;]+/g, "-");
        filename = filename.replace(/[\<]+/g, "(");
        filename = filename.replace(/[\>]+/g, ")");
        filename = filename.replace(/[\s]+/g, "_");
        filename = filename.replace(/[%]+/g, "@");
        //
        return filename;
    }

    var wiz_km_g_resourceFilesIndex = 0;

    function wiz_km_urlAdded(content, url)
    {
        return -1 != content.indexOf("=" + url + "\r\n");
    }

    function wiz_km_addURL(tmpDir, url, refURLObj)
    {
        if (!url)
            return "";
        //
        if (url == "")
            return "";
        //
        var contentConfig = "";
        //
        var aURL = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURL);
        
        try
        {    
            aURL.spec = url;                
        }
        catch (e)
        {
            return "";
        }
        //
        try
        {
            var newFileName = aURL.fileName.toLowerCase();
            if ( !newFileName ) 
                newFileName = "" + wiz_km_g_resourceFilesIndex;
            //
            newFileName = wiz_km_validateFileName(newFileName);
            //
            var targetFile = tmpDir.clone();
            targetFile.append(newFileName);
            //
            var webBrowserPersist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
            webBrowserPersist.persistFlags |= webBrowserPersist.PERSIST_FLAGS_FROM_CACHE;
            webBrowserPersist.persistFlags |= webBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
            //
            webBrowserPersist.saveURI(aURL, null, refURLObj, null, null, targetFile);
            //
            contentConfig += "\r\n" + wiz_km_g_resourceFilesIndex + "_URL=" + aURL.spec;
            contentConfig += "\r\n" + wiz_km_g_resourceFilesIndex + "_File=" + targetFile.path;
            //
            wiz_km_g_resourceFilesIndex++;
        }
        catch (ex)
        {
            dump("*** WIZ_PERSIST_FAILURE: " + url + "\n" + ex + "\n");
        }
        //
        return contentConfig;
    }

    function wiz_km_collectAllImages(tmpDir, doc, refURLObj)
    {
        var contentConfig = "";
        //
        var images = doc.images;
        for (var i = 0; i < images.length; i++)
        {
            var img = images[i];
            if (wiz_km_urlAdded(contentConfig, img.src))
                continue;
            contentConfig += wiz_km_addURL(tmpDir, img.src, refURLObj);
        }
        //
        return contentConfig;
    }
    function wiz_km_collectAllCSSs(tmpDir, doc, refURLObj)
    {
        var contentConfig = "";
        //
        var styleSheets = doc.styleSheets;
        for (var i = 0; i < styleSheets.length; i++)
        {
            var styleSheet = styleSheets[i];
            if (wiz_km_urlAdded(contentConfig, styleSheet.href))
                continue;
            contentConfig += wiz_km_addURL(tmpDir, styleSheet.href, refURLObj);
        }
        //
        return contentConfig;
    }

    function wiz_km_collectAllLinks(tmpDir, doc, refURLObj)
    {
        var contentConfig = "";
        //
        var links = doc.links;
        for (var i = 0; i < links.length; i++)
        {
            var link = links[i];
            if (link.rel && link.href)
            {
                if (link.rel.toLowerCase() == "stylesheet")
                {
                    if (wiz_km_urlAdded(contentConfig, link.href))
                        continue;
                    contentConfig += wiz_km_addURL(tmpDir, link.href, refURLObj);
                }
            }
        }
        //
        return contentConfig;
    }

    function wiz_km_getFrameNodes(win)
    {
        var doc = win.document;
        if (doc == null)
            return null;
        //
        var frameNodes = doc.getElementsByTagName("iframe");
        if (frameNodes == null || frameNodes.length == 0)
        {
            frameNodes = doc.getElementsByTagName("frame");
            if (frameNodes == null || frameNodes.length == 0)
            {
                return null;
            }
        }
        //
        return frameNodes;
    }

    function wiz_km_collectAllFlash(tmpDir, doc, refURLObj)
    {
        return "";
        //
        //
        var contentConfig = "";
        //
        var embeds = doc.embeds;
        for (var i = 0; i < embeds.length; i++)
        {
            var embed = embeds[i];
            if (embed.type.toLowerCase() == "application/x-shockwave-flash")
            {
                if (wiz_km_urlAdded(contentConfig, embed.src))
                    continue;
                contentConfig += wiz_km_addURL(tmpDir, embed.src, refURLObj);
            }
        }
        //
        return contentConfig;
    }

    var wiz_km_g_frameNameIndex = 0;
    function wiz_km_prepareFrameNodes(win)
    {
        var frameNodes = wiz_km_getFrameNodes(win);
        if (frameNodes == null)
            return;
        //
        for (var i = 0; i < frameNodes.length; i++)
        {
            var node = frameNodes[i];
            //
            node.setAttribute("wiz_ext_name", "Frame_" + wiz_km_g_frameNameIndex);
            //
            wiz_km_g_frameNameIndex++;
        }
    }
    function wiz_km_prepareFrames(win)
    {
        if (win == null)
            return;
        //
        var doc = win.document;
        if (doc == null)
            return;
        //
        wiz_km_prepareFrameNodes(win);
        //
        var frames = win.frames;
        if (frames == null)
            return;
        //
        for (var i = 0; i < frames.length; i++)
        {
            var frame = frames[i];
            //
            wiz_km_prepareFrames(frame);
        }
    }
    function wiz_km_prepareAllFrames(win)
    {
        wiz_km_g_frameNameIndex = 0;
        wiz_km_prepareFrames(win);
    }

    var wiz_km_g_frameFilesIndex = 0;
    function wiz_km_collectFrames(tmpDir, win)
    {
        var contentConfig = "";
        //
        if (win == null)
            return "";
        //
        var frameNodes = wiz_km_getFrameNodes(win);
        if (frameNodes == null)
            return "";
        //
        for (var i = 0; i < frameNodes.length; i++)
        {
            var frameNode = frameNodes[i];
            //
            if (frameNode != null)
            {
                var id = frameNode.getAttribute("id");
                var name = frameNode.getAttribute("name");
                var extName = frameNode.getAttribute("wiz_ext_name");
                //
                if (id == null)
                    id = "";
                if (name == null)
                    name = "";
                if (extName == null)
                    extName = "";
                //
                var frameDoc = frameNode.contentDocument;
                if (frameDoc != null)
                {
                    var targetFile = tmpDir.clone();
                    targetFile.append("Frame_" + wiz_km_g_frameFilesIndex + ".htm");
                    //
                    contentConfig += "\r\n" + wiz_km_g_frameFilesIndex + "_FrameURL=" + frameDoc.URL;
                    contentConfig += "\r\n" + wiz_km_g_frameFilesIndex + "_FrameName=" + name;
                    contentConfig += "\r\n" + wiz_km_g_frameFilesIndex + "_FrameID=" + id;
                    contentConfig += "\r\n" + wiz_km_g_frameFilesIndex + "_FrameExtName=" + extName;
                    contentConfig += "\r\n" + wiz_km_g_frameFilesIndex + "_FrameFileName=" + targetFile.path;
                    //
                    var contentHTML = frameDoc.documentElement.innerHTML;
                    wiz_km_writeFileWithCharset(targetFile, contentHTML, "utf-8");
                    //
                    wiz_km_g_frameFilesIndex++;
                }
            }
        }
        //
        var frames = win.frames;
        for (var i = 0; i < frames.length; i++)
        {
            var frame = frames[i];
            //        
            contentConfig += wiz_km_collectFrames(tmpDir, frame);
        }
        //
        return contentConfig;
    }

    function wiz_km_collectAllFrames(tmpDir, win)
    {
        wiz_km_g_frameFilesIndex = 0;
        //
        var contentConfig = "";
        //
        var targetFile = tmpDir.clone();
        targetFile.append("Frame_" + wiz_km_g_frameFilesIndex + ".htm");
        //
        contentConfig += "\r\n" + wiz_km_g_frameFilesIndex + "_FrameURL=" + win.document.URL;
        contentConfig += "\r\n" + wiz_km_g_frameFilesIndex + "_FrameFileName=" + targetFile.path;
        //
        var contentHTML = win.document.documentElement.innerHTML;
        wiz_km_writeFileWithCharset(targetFile, contentHTML, "utf-8");
        //
        wiz_km_g_frameFilesIndex++;
        //
        contentConfig += wiz_km_collectFrames(tmpDir, win);
        //
        return contentConfig;
    }

    function wiz_km_isSelected(win)
    {
        var doc = win.document;
        if (!doc)
            return false;
        //
    	var sel = doc.getSelection();
    	if (!sel)
    	    return false;
    	//
    	var text = sel.toString();
    	if (!text)
    	    return false;
    	//
    	if (text.length == 0)
    	    return false;
    	//
    	return true;
    }

    function wiz_km_getActiveFrame(win)
    {
    	var frames = win.frames;
        for (var i = 0; i < frames.length; i++)
        {
            var frame = frames[i];
            if (wiz_km_isSelected(frame))
                return frame;
            //
            var frameChild = wiz_km_getActiveFrame(frame);
            if(frameChild)
            	return frameChild;
        }
        return null;
    }

    function wiz_km_getSelectedWindow(win)
    {
        if (wiz_km_isSelected(win))
            return win;
    	//
    	var activeFrame  = wiz_km_getActiveFrame(win);
    	if(activeFrame)
    		return activeFrame;
        //
    	return null;
    }

    function wiz_km_saveDocument(info)
    {
        var alertsSvc = null;
        try
        {
            var icon = "chrome://wiz/skin/wiz.png";
            alertsSvc = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
    	    alertsSvc.showAlertNotification(icon, "Wiz", "Collecting images...");
    	}
    	catch (err)
    	{
    	}

        try
        {
            var subDir = Math.round(Math.random() * 10000000);
            //
            const cc = Components.classes;
            const ci = Components.interfaces;
            const fileLocator = cc["@mozilla.org/file/directory_service;1"].getService(ci.nsIProperties);
            var tmpDir = fileLocator.get("TmpD", ci.nsIFile);
            //
            tmpDir.append("Wiz");
            if (!tmpDir.exists())
            {
                tmpDir.create(1, 0);
            }
            //
            tmpDir.append(subDir);
            if (!tmpDir.exists())
            {
                tmpDir.create(1, 0);
            }
            
            //
            var win = (info && info.win) ? (info.win) : (document.commandDispatcher.focusedWindow.top);
            var doc = win.document;
            //
            var refURLObj = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI);
            refURLObj.spec = doc.URL;
            //
            //config file
            var fileNameHTMLAll = tmpDir.clone();
            fileNameHTMLAll.append("wiz_km_firefox_all.htm");
            //
            var fileNameHTMLSel = tmpDir.clone();
            fileNameHTMLSel.append("wiz_km_firefox_sel.htm");
            //
            var fileNameConfig = tmpDir.clone();
            fileNameConfig.append("wiz_km_firefox.ini");
            //
            var urlSel = "";
            var contentHTMLSel = "";
            //
            var selectedWin = wiz_km_getSelectedWindow(win);
            if (selectedWin)
            {
                var sel = selectedWin.getSelection();
                if (sel)
                {
                    var selPrivate = sel.QueryInterface(Components.interfaces.nsISelectionPrivate);
                    if (selPrivate)
                    {
                        if (selPrivate.focusNode && selPrivate.focusNode.ownerDocument)
                        {
                            urlSel = selPrivate.focusNode.ownerDocument.URL;
                        }
                        //
                        contentHTMLSel = selPrivate.toStringWithFormat("text/html", 0, 0);
                    }
                }
            }
            //
            var contentConfig = "[Common]\r\nURL=" + doc.URL 
                + "\r\nTitle=" + doc.title
                + "\r\nFileNameAll=" + fileNameHTMLAll.path
                + "\r\nFileNameSel=" + fileNameHTMLSel.path
                + "\r\nURLSel=" + urlSel;
            //
            //frames//
            //
            wiz_km_prepareAllFrames(win);
            //
            contentConfig += "\r\n[Frames]"
            contentConfig += wiz_km_collectAllFrames(tmpDir, win.top);
            contentConfig += "\r\nCount=" + wiz_km_g_frameFilesIndex;
            //
            //resources//
            //
            wiz_km_g_resourceFilesIndex = 0;
            //
            contentConfig += "\r\n[Resources]";
            contentConfig += wiz_km_collectAllImages(tmpDir, doc, refURLObj);
            contentConfig += wiz_km_collectAllCSSs(tmpDir, doc, refURLObj);
            contentConfig += wiz_km_collectAllLinks(tmpDir, doc, refURLObj);
            contentConfig += wiz_km_collectAllFlash(tmpDir, doc, refURLObj);
            //
            contentConfig += "\r\nCount=" + wiz_km_g_resourceFilesIndex;
            //
            if (info) {
                contentConfig += "\r\n[ExtraCommand]";
                contentConfig += addExtraParams(info);
            }
            Wiz.logger.debug(contentConfig);
            //
            wiz_km_writeFileWithCharset(fileNameConfig, contentConfig, "utf-8");
            //
            var contentHTMLAll = doc.documentElement.innerHTML;
            wiz_km_writeFileWithCharset(fileNameHTMLAll, contentHTMLAll, "utf-8");
            //
            wiz_km_writeFileWithCharset(fileNameHTMLSel, contentHTMLSel, "utf-8");
            //
            var fileNameExe = wiz_km_getWizAppPath() + "Wiz.exe";
            //
            var exeFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            exeFile.initWithPath(fileNameExe);
            //
            var dllFileName = wiz_km_getWizAppPath() + "NPWizWebCapture.dll";
            var functionName = "WizKMResourceToDocument";
            //
            var params = fileNameConfig.path;
            params = wiz_km_unicodeToBytes(params, "utf-8");
            params = wiz_km_base64Encode(params);
            params = "/FileName=" + params;
            params = params.replace(/\r/gi, "");
            params = params.replace(/\n/gi, "");
            //
            //2012-10-17nslProcess传入cmdLineExe必须要使用本地字符集编码
            //从注册表中获取的目录信息是unicode
            var httpCharset = getLocaleCharset().toLowerCase();
            dllFileName = wiz_km_unicodeToBytes(dllFileName, Wiz.CHARSETMAP[httpCharset]);
            //
            var cmdLineExe = [dllFileName, functionName, params];
            //
            Wiz.logger.debug('Wiz Native Client dll File');
            Wiz.logger.debug(cmdLineExe);
            wiz_km_runExeFile(exeFile, cmdLineExe, false);
            getLocaleCharset();
        }
        catch (err)
        {
            throw err;
        }
    }

    /**
     * 获取本地字符集
     * @return {[type]} [description]
     */
    function getLocaleCharset() {
        try {
            const cc = Components.classes;
            const ci = Components.interfaces;
            var localeService = cc["@mozilla.org/intl/nslocaleservice;1"].getService(ci.nsILocaleService);
            var charset = localeService.getSystemLocale().getCategory('NSILOCALE_CTYPE');
            return charset;
        } catch (err) {
            throw err;
        }
        // NSILOCALE_COLLATE - Collation order. How strings are sorted.
        // NSILOCALE_CTYPE - Character classification and case conversion.
        // NSILOCALE_MONETARY - Monetary formatting.
        // NSILOCALE_NUMERIC - Numeric, non-monetary formatting.
        // NSILOCALE_TIME - Date and time formats.
        // NSILOCALE_MESSAGES - Related to fonts, character encodings and so on.

    }

    function addExtraParams(info) {
        try {
            Wiz.logger.debug('Wiz.MozillaNativeController.addExtraParams ' + info.cmd);
            // var comment = (info.comment) ? ('<div>' + info.comment.replace(/\n/gi, '<br />') + '</div>') : '',
            var params = '\r\nSaveCommand=' + info.cmd + '\r\nUserId=' + info.userid
                + '\r\nTitle=' + info.title 
                + '\r\nLocation=' + info.category 
                + '\r\nComments=' + wiz_km_base64Encode(wiz_km_unicodeToBytes(info.comment, 'utf-8'));
            return params;
        } catch (err) {
            Wiz.logger.error('MozillaNativeController.addExtraParams() Error: ' + err);
        }
    }

    function wiz_km_onWizSave(info)
    {
        wiz_km_saveDocument(info);
    }

    function bInstall() 
    {
        try {
            var appPath = wiz_km_getWizAppPath();
            if (appPath && appPath.length > 1) {
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    }

    this.startClip = wiz_km_onWizSave;
    this.getAppPath = wiz_km_getWizAppPath;
    this.bInstall = bInstall;
}
