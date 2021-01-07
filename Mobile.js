/* All JavaScript here will be loaded for users of the mobile site */
mw.vars = {
	use: function() {
		// please translate
		mw.notify('You are loading a gadget on mobile that is not supported. Please notify your gadget developer.')
		return {
                   // avoid TypeError: mw.vars.use(...).set is not a function 
                   set: function () {}
                 };
	}
};

window.importScript = function () {
		mw.notify('You are trying to load a script via the deprecated importScript method which is not available on mobile. Please notify your gadget developer.');
}
