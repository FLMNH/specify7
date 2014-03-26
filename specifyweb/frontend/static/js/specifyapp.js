define([
    'jquery', 'underscore', 'backbone', 'schema', 'businessrules',
    'errorview', 'welcomeview', 'headerui', 'notfoundview', 'navigation',
    'text!context/user.json!noinline',
// Tasks
    'datatask',
    'querytask',
    'expresssearchtask',
    'datamodeltask',
    'attachmentstask'
], function module(
    $, _, Backbone, schema, businessRules, errorview,
    WelcomeView, HeaderUI, NotFoundView, navigation,
    userJSON) {
    "use strict";
    var tasks = _(arguments).tail(module.length);
    var user = $.parseJSON(userJSON);  // the currently logged in SpecifyUser

    var currentView;

    // get a reference to the content div
    // where we will draw the rest of the app
    var rootContainer = $('#content');

    // make the Backbone routing mechanisms ignore queryparams in urls
    // this gets rid of all that *splat cruft in the routes
    var loadUrl = Backbone.history.loadUrl;
    Backbone.history.loadUrl = function(url) {
        var stripped = url && url.replace(/\?.*$/, '');
        return loadUrl.call(this, stripped);
    };


    // gets rid of any backbone view currently showing
    // and replaces it with the rendered view given
    // also manages other niceties involved in changing views
    function setCurrentView(view) {
        currentView && currentView.remove(); // remove old view
        rootContainer.empty();
        $('.ui-autocomplete').remove(); // these are getting left behind sometimes
        $('.ui-dialog-content').dialog('close'); // close any open dialogs
        currentView = view;
        currentView.render();
        rootContainer.append(currentView.el);
    }

    function handleError(jqxhr) {
        setCurrentView(new errorview.ErrorView({ request: jqxhr }));
        jqxhr.errorHandled = true;
    }

    function handleUnexpectedError(event, jqxhr, settings, exception) {
        if (jqxhr.errorHandled) return; // Not unexpected.
        if (jqxhr.status === 403) {
            $('<div title="Insufficient Privileges">'
              + 'You lack sufficient privileges for that action, '
              + 'or your current session has been logged out.</div>')
                .appendTo('body').dialog({
                    modal: true,
                    open: function(evt, ui) { $('.ui-dialog-titlebar-close', ui.dialog).hide(); },
                    buttons: [{
                        text: 'Login',
                        click: function() {
                            window.location = "/accounts/login/?next=" + window.location.href;
                        }
                    }]});
            return;
        }
        new errorview.UnhandledErrorView({jqxhr: jqxhr}).render();

        console.log(arguments);
    }

    var SpecifyRouter = Backbone.Router.extend({
        __name__: "SpecifyRouter",
        // maps the final portion of the URL to the appropriate backbone view
        routes: {
            ''           : 'welcome',
            'test_error/': 'testError', // cause a internal server error for testing
            '*whatever'  : 'notFound'   // match anything else.
        },

        // show a 'page not found' view for URLs we don't know how to handle
        notFound: function() {
            setCurrentView(new NotFoundView());
            window.document.title = 'Page Not Found | Specify WebApp';
        },

        // this view shows the user the welcome screen
        welcome: function() {
            setCurrentView(new WelcomeView());
            window.document.title = 'Welcome | Specify WebApp';
        },

        testError: function() {
            $.get('/api/test_error/');
        }
    });

    function appStart() {
        $(document).ajaxError(handleUnexpectedError);
        businessRules.enable(true);
        (new HeaderUI()).render();
        _.each(tasks, function(task) { task(app); });

        // start processing the urls to draw the corresponding views
        Backbone.history.start({pushState: true, root: '/specify/'});

        $('body').delegate('a.intercept-navigation', 'click', function(evt) {
            evt.preventDefault();
            var href = $(evt.currentTarget).prop('href');
            href && navigation.go(href);
        }).delegate('form', 'submit', false);
    }

    // the exported interface
    var app = {
        router: new SpecifyRouter(),
        handleError: handleError,
        setCurrentView: setCurrentView,
        getCurrentView: function() { return currentView; },  // a reference to the current view
        start: appStart,    // called by main.js to launch the webapp frontend
        user: user,
        isReadOnly: !_(['Manager', 'FullAccess']).contains(user.usertype)
    };

    return app;
});
