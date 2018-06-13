var mainViewVM = null;
$(function () {
    mainViewVM = new MainViewModel();
    mainViewVM.init();
});

function MainViewModel()
{

    this.restClient = new RESTClient();
    this.loaderApi = new LoaderAPI();
    this.defaultModal = $('#defaultModal');
    this.webserviceJubarteBaseURL = WEBSERVICE_JUBARTE_BASE_URL;

    this.pageLoginView = $("#pageLoginView");
    this.pageMainView = $("#pageMainView");
    this.iframeShowPage = $("#iframeShowPage");

    //FORMULARIO DE LOGIN
    this.btnLogar = $('#btnLogar');
    this.inputUserPass = $('#inputSenha');
    this.inputUserName = $('#inputNomeUsuario');

    //TOKEN CONFIG
    this.accessTokenKey = 'YWNjZXNzX3Rva2Vu';
    this.expiresInKey = 'ZXhwaXJlc19pbg==';
    this.userFullNameKey = 'ZnVsbF9uYW1l';
    this.expirationTimeKey = 'expirationTime';
    this.loginNameKey = 'loginName';
    this.idPessoaKey = 'idPessoa';
    this.idOrganogramaKey = 'idOrganograma';
    this.idPerfilKey = 'idPerfil';

    //ULTIMOS EMAILS
    this.lastEmailsContainer = $('#lastEmailsContainer');

    //MENU PRINCIPAL
    this.sidebarMainMenu = $('#sidebarMainMenu');
    this.btnMainMenu = $('[name="btn-main-menu"]');
    this.btnDetachedRBar = $('[name="btn-detached-right-bar"]');
    this.breadcrumb = null;

    this.menuAPI = new MenuAPI('sidebarMainMenu');

    //
    this.btnLogout = $('#btnLogout');
    this.btnLogout2 = $('#btnLogout2');
    this.displayUserName = $('.displayUserName');
    this.displaySaldacao = $('.displaySaldacao');

    //FORM BUG REPORT
    this.btnSendBugReport = $('#btnSendBugReport');
    this.btnOpenModalBugReport = $('#btnOpenModalBugReport');
    this.pasteClipboardData = null;
    this.screenshotData = null;
    this.inputNomeSistema = $('#inputNomeSistema');
    this.inputPaginaSistema = $('#inputPaginaSistema');
    this.textareaDescricaoProblema = $('#textareaDescricaoProblema');
    this.printScreenThumbnail = $('#printScreenThumbnail');

    //mail Dropdown Menu Container
    this.mailDropdownContainer = $('#mailDropdownContainer');

    //client ip
    this.ipPrivado = '';
    this.ipPublico = '';
}

MainViewModel.prototype.init = function () {
    var self = this;

    // PerfectScrollBar
    new PerfectScrollbar( $(".sidebar-fixed .sidebar-content")[0], {
        wheelPropagation: true
    });

    var regexMob = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    var regexDesk = /Linux|Windows|Macintosh/i;

    if(regexDesk.test(navigator.userAgent)) {
        $('#videoPlay').append('<source src="/cdn/Assets/video/bgJubarteNovo.mp4" type="video/mp4">');
    }

    //get client private ip
    getUserIP(function(ip){
        self.ipPrivado = ip;
    });
    //get client public ip
    /*$.getJSON('//gd.geobytes.com/GetCityDetails?callback=?', function(data) {
        //console.log(JSON.stringify(data, null, 2));
        self.ipPublico = data['geobytesremoteip'];
        // console.log(self.ipPublico);
    });*/


    $.getJSON('https://api.ipify.org?format=json', function(data) {
        self.ipPublico = data['ip'];
       // console.log(self.ipPublico);
    });

    self.eventos();

    if (sessionStorage.getItem(self.accessTokenKey))
    {
        self.checkToken();
    }
    else
    {
        self.showLoginView();
    }

};
MainViewModel.prototype.initPostAuth = function () {
    var self = this;

    self.menuAPI.setMethod('GET');
    self.menuAPI.setDisplayItems([
        {'key':'id', 'type':MenuAPI.ID},
        {'key':'icone', 'type':MenuAPI.ICON},
        {'key':'label', 'type':MenuAPI.LABEL},
        {'key':'nodes', 'type':MenuAPI.NODES},
        {'key':'rota', 'type':MenuAPI.ROUTE}
    ]);
    self.menuAPI.setWebServiceURL(this.webserviceJubarteBaseURL + 'menus');
    self.menuAPI.setTarget('iframeShowPage');
    self.menuAPI.setOnMenuItemClick(function (breadcrumb) {
        self.breadcrumb = breadcrumb;
    });
    self.menuAPI.load();
    self.getLastEmails();

    self.displaySaldacao.html(self.saudacao());
    var userFullName = sessionStorage.getItem(self.userFullNameKey);
    self.displayUserName.text(userFullName);

    $('.userThumbnailLarge').css('background-color', stringToColour(userFullName));
    $('.userThumbnailLarge i').text(retornarIniciais(userFullName));



};
MainViewModel.prototype.loop = function () {
    var self = this;
};
MainViewModel.prototype.eventos = function () {
    var self = this;

    // oculta todos os botoes da top-bar com a classe dynamic
    self.btnMainMenu.on('click', function () {
        var frameBody = self.iframeShowPage.contents().find('body');
        if (!frameBody.hasClass('sidebar-detached-hidden'))
        {
            frameBody.addClass('sidebar-detached-hidden');
        }
    });

    // alternar com menu desanexado lateral
    self.btnDetachedRBar.on('click', function () {
        var frameBody = $("iframe#iframeShowPage").contents().find('body');
        frameBody.toggleClass('sidebar-detached-hidden');
        if (!frameBody.hasClass('sidebar-detached-hidden'))
        {
            $('body#window').addClass('sidebar-xs');
        }
    });

    //login
    self.btnLogar.click(function () {
        self.autenticar();
    });
    self.inputUserName.keypress(function (e) {
        if (e.which === 13)
        {
            self.autenticar();
        }
    });
    self.inputUserPass.keypress(function (e) {
        if (e.which === 13)
        {
            self.autenticar();
        }
    });

    //logout
    self.btnLogout.click(function () {
        self.logout();
    });
    self.btnLogout2.click(function () {
        self.logout();
    });

    //
    self.btnSendBugReport.click(function (e) {
        self.sendBugReport();
    });

    self.btnOpenModalBugReport.click(function () {
        self.printScreen();
    });

    //quando o iframe terminar de carregar uma pagina
    self.iframeShowPage.on('load',function () {
        self.onPageLoaded();
    });

    //evento botão minimiza menu lateral
    $('.sidebar-main-toggle').on('click', function (e) {
        e.preventDefault();

        // Toggle min sidebar class
        $('body').toggleClass('sidebar-xs');
    });

    //evento que fechas os dropdowns da barra jubarte
    var listener = window.addEventListener('blur', function() {
        if (document.activeElement === document.getElementById('iframe')) {

        }else {
            $('.dropdown-toggle').each(function () {
                var ele = $(this);

                if(ele.attr('aria-expanded') == undefined){

                }else if(ele.attr('aria-expanded') == 'true'){
                    //ele.trigger('click');
                    ele.dropdown('toggle');
                    return
                }
            });
        }
        window.removeEventListener('blur', listener);
    });

    /*
    //obtem dados do evento paste clipbord
    document.addEventListener('paste', function (evt) {
        console.log(evt.clipboardData.getData('text/plain'));
        console.log(evt.clipboardData.getData('image/png'));
        self.pasteClipboardData = evt.clipboardData;
        //console.log(evt.clipboardData);
    });

    document.onpaste = function(event){
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        console.log(JSON.stringify(items)); // will give you the mime types
        for (index in items) {
            var item = items[index];
            if (item.kind === 'file') {
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(event){
                    console.log(event.target.result)}; // data url!
                reader.readAsDataURL(blob);
            }
        }
    };*/

};
MainViewModel.prototype.autenticar = function () {
    var self = this;
    self.loaderApi.show();

    //obtem dados do formulario de login
    var dataToSender = {
        "userName": self.inputUserName.val(),
        "password": self.inputUserPass.val(),
        "ipPrivado": self.ipPrivado,
        "ipPublico": self.ipPublico
    };

    //console.log(dataToSender);

    //faz uma requisição a API Rest para autenticar
    self.restClient.setDataToSender(dataToSender);
    self.restClient.setWebServiceURL(self.webserviceJubarteBaseURL + 'auth/login');
    self.restClient.setMethodPOST();
    //caso sucesso
    self.restClient.setSuccessCallbackFunction(function (data) {

        sessionStorage.setItem(self.accessTokenKey, data['accessToken']);
        sessionStorage.setItem(self.expiresInKey, data['expiresIn']);
        sessionStorage.setItem(self.loginNameKey, data['loginName']);
        sessionStorage.setItem(self.userFullNameKey, data['fullName']);
        sessionStorage.setItem(self.expirationTimeKey, data['expiresIn']);
        sessionStorage.setItem(self.idPessoaKey, data['idPessoa']);
        sessionStorage.setItem(self.idOrganogramaKey, data['idOrganograma']);
        sessionStorage.setItem(self.idPerfilKey, data['idPerfil']);
        self.initPostAuth();
        self.showMainView();
        self.loaderApi.hide();
    });
    self.restClient.setErrorCallbackFunction(function (jqXHR, textStatus, errorThrown) {
        self.loaderApi.hide();
        alert('Credencial Invalida!');
    });
    self.restClient.exec();
};
MainViewModel.prototype.checkToken = function () {
    var self = this;
    self.loaderApi.show();
    //faz uma requisição a API Rest para validar token
    self.restClient.setDataToSender({"access_token": sessionStorage.getItem(self.accessTokenKey)});
    self.restClient.setWebServiceURL(self.webserviceJubarteBaseURL + 'auth/check');
    self.restClient.setMethodPOST();
    self.restClient.setSuccessCallbackFunction(function (data) {
        self.showMainView();
        self.loaderApi.hide();
        self.initPostAuth();
    });
    self.restClient.setErrorCallbackFunction(function (jqXHR, textStatus, errorThrown) {
        self.showLoginView();
        self.loaderApi.hide();
    });
    self.restClient.exec();
};
MainViewModel.prototype.logout = function () {
    var self = this;
    sessionStorage.removeItem(self.accessTokenKey);
    sessionStorage.removeItem(self.expiresInKey);
    sessionStorage.removeItem(self.loginNameKey);
    sessionStorage.removeItem(self.userFullNameKey);
    sessionStorage.removeItem(self.expirationTimeKey);
    sessionStorage.removeItem(self.idPessoaKey);
    sessionStorage.removeItem(self.idOrganogramaKey);
    sessionStorage.removeItem(self.idPerfilKey);
    //location.reload();
    redirect('/');
};
MainViewModel.prototype.showMainView = function () {
    var self = this;

    self.pageLoginView.css('display', 'none');
    self.pageMainView.css('display', 'block');
    self.pageMainView.css('opacity', '1');
    /*self.pageMainView.css('opacity', '1');
    $('.formLoginContainer').animate({
        height: ["toggle", "swing"]
    }, {
        duration: 300, specialEasing: {
            width: "easeOutBounce", height: "easeOutBounce"
        }, complete: function () {

            self.pageLoginView.animate({height: [ "toggle", "swing" ]
            }, 300, function () {

            });
        }
    });*/
};
MainViewModel.prototype.showLoginView = function () {
    var self = this;

    self.pageMainView.css('display', 'none');
    self.pageMainView.css('opacity', '0');

    self.pageLoginView.css('opacity', '1');
    self.pageLoginView.css('display', 'block');

};
MainViewModel.prototype.redirectToZimbra = function () {
    var self = this;

    self.restClient.setDataToSender({});
    self.restClient.setWebServiceURL(self.webserviceJubarteBaseURL + 'emails/redirect');
    self.restClient.setMethodGET();
    self.restClient.setSuccessCallbackFunction(function (data) {
        var redirectURL = data['redirectURL'];
        self.lastEmailsContainer.find('a').each(function (a, b) {
            $(this).attr('href', redirectURL);
            $(this).attr('target', '_blank');
        });

    });
    self.restClient.setErrorCallbackFunction(function (jqXHR, textStatus, errorThrown) {
        alert('erro');
    });
    self.restClient.exec();

};
MainViewModel.prototype.getLastEmails = function () {
    var self = this;

    var html = '<li class="media">'
        + '<a href="#" class="media-heading btnRedirectEmail">'
        + '<div class="media-left">'
        //+ '<img src="/cdn/Vendor/limitless/material/images/placeholder.jpg" class="img-circle img-sm" alt="">'
        + '<span class="userThumbnail" style="background:rgb(52,40,113);"><i>IA</i></span>'
        + '</div>'
        + '<div class="media-body">'
        + '<span class="text-semibold remetenteNomeEmail" >Margo Baker</span>'
        + '<span class="media-annotation pull-right horaEmail">12:16</span>'
        + '<br><span class="text-muted assuntoEmail">That was something he was unable to do because...'
        + '</span>'
        + '<p class="text-muted text-right dataEmail "></p>'
        + '</div>'
        + '</a>'
        + '</li>';

    self.loaderApi.show(self.mailDropdownContainer);
    //faz uma requisição a API Rest para validar token
    self.restClient.setDataToSender({});
    self.restClient.setWebServiceURL(self.webserviceJubarteBaseURL + 'emails');
    self.restClient.setMethodPOST();
    self.restClient.setSuccessCallbackFunction(function (data) {

        self.loaderApi.hide();
        self.redirectToZimbra();
        var emails = data['data'];
        self.lastEmailsContainer.empty();

        for (var i = 0; i < emails.length; i++)
        {
            var template = $(html);
            template.find('.assuntoEmail').text(emails[i]['assunto']);
            template.find('.horaEmail').text(emails[i]['hora']);
            template.find('.remetenteNomeEmail').text(emails[i]['de']);
            template.find('.userThumbnail i').text(emails[i]['iniciais']);
            template.find('.userThumbnail').css('background-color', stringToColour(emails[i]['de']));
            template.find('.dataEmail').text(emails[i]['data']);
            if (emails[i]['lido']===false){
                template.addClass('emailNotRead');
            }
            self.lastEmailsContainer.append(template);
        }
    });
    self.restClient.setErrorCallbackFunction(function (jqXHR, textStatus, errorThrown) {

        self.loaderApi.hide();
        alert('erro');
    });
    self.restClient.exec();

};
MainViewModel.prototype.saudacao = function () {
    var self = this;

    var mdata = new Date();
    var mhora = mdata.getHours();
    var mdia = mdata.getDate();
    var mdiasemana = mdata.getDay();
    var mmes = mdata.getMonth();
    var mano = mdata.getYear();

    if (mhora < 12)
    {
        return 'Bom dia,';
    }
    else if (mhora >= 12 && mhora < 18)
    {
        return 'Boa Tarde,';
    }
    else if (mhora >= 18 && mhora < 24)
    {
        return 'Boa Noite,';
    }
};
//faz um printScreen da pagina
MainViewModel.prototype.printScreen = function () {
    var self = this;
    //e.clipboardData ||
    //var clipboardData =  window.clipboardData;
    //var pastedData = clipboardData.getData('Text');
    //var data = ClipboardEvent.clipboardData;
    //console.log(data);

    html2canvas(document.body).then(function (canvas) {
        //document.body.appendChild(canvas);
        self.screenshotData = canvas.toDataURL("image/jpeg",0.5);
        self.printScreenThumbnail.css({
            "background":"url('"+self.screenshotData+"')",
            "background-repeat": "no-repeat",
            "background-size": "260px "
        });
    });

};
//reporta um bug encontrado
MainViewModel.prototype.sendBugReport = function (e) {
    var self = this;

   // console.log(self.screenshotData);

    var dataToSend = {
        "sistema": self.inputNomeSistema.val(),
        "pagina": self.inputPaginaSistema.val(),
        "descricaoProblema": self.textareaDescricaoProblema.val(),
        "screenshot": self.screenshotData
    };

    //console.log(JSON.stringify(dataToSend));

    self.loaderApi.show();
    self.restClient.setDataToSender(dataToSend);
    self.restClient.setWebServiceURL(self.webserviceJubarteBaseURL + 'bugreport/');
    self.restClient.setMethodPUT();
    self.restClient.setSuccessCallbackFunction(function (data) {
        self.loaderApi.hide();
        alert("Enviado com sucesso!");
    });
    self.restClient.setErrorCallbackFunction(function (jqXHR, textStatus, errorThrown) {
        self.loaderApi.hide();
    });
    self.restClient.exec();
};
//QUANDO UMA PAGINA TERMINAR DE CARREGAR NO IFRAME
MainViewModel.prototype.onPageLoaded = function (e) {
    var self = this;

    var rodape = '&copy; 2017 - 2018. Plataforma Jubarte desenvolvida pela Coordenadoria de Tecnologia de Informação - COTINF <a href="/pages/creditos"><span class="ml-20 label label-info"><i class="icon-info3 position-left"></i>Info</span></a> <span class="ml-20 label label-success"><i class="icon-trophy2"></i> COMODO SSL </span>';

    self.iframeShowPage.contents().find('.breadcrumb').empty().append(self.breadcrumb);
    self.iframeShowPage.contents().find('.footer').empty().append(rodape);

};

//FUNÇÔES GLOBAIS PUBLICAS
function getModal()
{
    return new ModalAPI();
}

function getPrincipalVM()
{
    return mainViewVM;
}

function getMainNavbar()
{
    return $('#navbar-mobile');
}

//UTILITARIOS DE CLIPBOARD
/*
function handlepaste (elem, e) {
    var savedcontent = elem.innerHTML;
    if (e && e.clipboardData && e.clipboardData.getData) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
        if (/text\/html/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/html');
        }
        else if (/text\/plain/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/plain');
        }
        else {
            elem.innerHTML = "";
        }
        waitforpastedata(elem, savedcontent);
        if (e.preventDefault) {
            e.stopPropagation();
            e.preventDefault();
        }
        return false;
    }
    else {// Everything else - empty editdiv and allow browser to paste content into it, then cleanup
        elem.innerHTML = "";
        waitforpastedata(elem, savedcontent);
        return true;
    }
}
function waitforpastedata (elem, savedcontent) {
    if (elem.childNodes && elem.childNodes.length > 0) {
        processpaste(elem, savedcontent);
    }
    else {
        that = {
            e: elem,
            s: savedcontent
        }
        that.callself = function () {
            waitforpastedata(that.e, that.s)
        }
        setTimeout(that.callself,20);
    }
}
function processpaste (elem, savedcontent) {
    pasteddata = elem.innerHTML;
    //^^Alternatively loop through dom (elem.childNodes or elem.getElementsByTagName) here

    elem.innerHTML = savedcontent;

    // Do whatever with gathered data;
    alert(pasteddata);
}
*/
