/**
	Replaces the scope in a function with the object’s one.
	Based on definition from the Prototype framework (http://prototype.conio.net/).
*/
Function.prototype.bind = function(object) {
	var __method = this;
	return function() {
		return __method.apply(object, arguments);
	}
}


{{МедияУики:Common.js/Titlefix}}


{{МедияУики:Common.js/Import}}


{{МедияУики:Common.js/Media player}}


{{МедияУики:Common.js/Edit section}}


{{МедияУики:Common.js/Extern message}}


/* * * * * * * * * *   Edit tools functions   * * * * * * * * * */

{{МедияУики:Common.js/Edit tools data}}

{{МедияУики:Common.js/Edit tools}}


/* * * * * * * * * *   Wikificator functions   * * * * * * * * * */

{{МедияУики:Common.js/Wikificator}}


/* * * * * * * * * *   Featured article marker   * * * * * * * * * */

{{МедияУики:Common.js/FA}}


/* * * * * * * * * *   Dynamic Navigation Bars   * * * * * * * * * */

{{МедияУики:Common.js/Navbar}}