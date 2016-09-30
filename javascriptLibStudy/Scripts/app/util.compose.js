//In util:

import co = require("constants");
var constants = co.constants;

/**
   * Compose takes functions (operations)
   * it returns a function that will run the passed functions on the passed parameter
   * if you pass 3 functions it will be executed in the following way:
   * function3(function2(function1(argument)));
   * example:
   * //==========================================================================================
   * //will return 52 for calcPercentage.bind({decimal:2},0.52)
   * //  depents on the invoking object (this value) to have a decimal property that is a number
   * var calcPercentage = function(val){return val * Math.pow(10,this.decimal)};
   * //formats 52(any coerced to string) to "52%" (string)
   * var percentageFormatter = function(val){return val + "%"};
   * //toPercentage takes a number and returns a string, like 0.52 will be "52%"
   * var toPercentage = util.compose(
   *   calcPercentage.bind({decimal:2})//need to bind the function to an object that has a decimal property
   *   ,percentageFormatter
   * );
   * console.log(toPercentage(0.52));//this will return "52%"
   * //==========================================================================================
   * 
   * If any of the methods passed returns a promise then the resulting funciton returns a promise
   *   unless a synchronous function returns constants.NOTHING because then the function returning 
   *   the promise is never called (see examples of NOTHING)
   * example:
   * //==========================================================================================
   * var asyncResult = util.compose(
   *   function one(arg){
   *     return Promise.resolve(arg+1);
   *   }
   *   ,function(arg){
   *     return arg+1;//you can mix asynch functions and synch functions
   *   }
   *   ,function(arg){
   *     return arg+1;//you can mix asynch functions and synch functions
   *   }
   * );
   * 
   * //because one of the functions passed to util.compose returns a promise
   * //  the resulting funciton returns a promise as well
   * asyncResult(0)
   * .then((result)=>console.log("OK",result));//logs "OK 3"
   * //==========================================================================================
   * 
   * If any of the passed functions returns constants.NOTHING the other processing functions will not be called
   * If any of the passed functions returns a promise that resolves in constants.NOTHING none of the other functions will be called
   * Depending if any of the functions could return a promise before NOTHING was returned or resolved it can or cannot return a promise
   *   if any function returns NOTHING synchronously before any funciton could return a promise then the result is NOTHING (no promise) (see example 1)
   *   if any function returns a promise (even resulting in NOTHING) a promise is returned (see example 2)
   *     this promise will resolve in NOTHING if the the promise resolves in nothing 
   *     no functions will be called after NOTHING is returned or resolved
   * 
   * require(["constants"],(c)=>{
   * 
   *   var constants = c.constants
   *   ,result
   * //example 1:
   *   ,asyncResult = util.compose(
   *     function one(){return constants.NOTHING; },
   *     //this function is never called because function one returned NOTHING
   *     function two(arg){
   *         console.error("This method should not be called (asyncResult composed method)");
   *         return Promise.resolve("Hello World");
   *     }
   *   )
   *   ,result2
   * //example 2:
   *   ,asyncResult2 = util.compose(
   *     function one(arg){
   *         return Promise.resolve("Hello World");
   *     },
   *     function two(){return constants.NOTHING; },
   *     //this function is never called because function two returned NOTHING
   *     function three(){console.error("This method should not be called (asyncResult2 composed method)"); }
   *   );
   * 
   *   //asyncResult will not return a promise because NOTHING was returned synchronously (not in a promise)
   *   //  therefore; function two is never called
   *   ((result = asyncResult(0))===constants.NOTHING)?
   *     console.log("Function did not return a promise but returned a value of NOTHING")
   *     :
   *     result.then((result)=>console.log("OK",result));//throws error becaue constants.NOTHING does not have .then method
   * 
   *   //asyncResult2 will return a promise because NOTHING was returned after a promise was returned
   *   //  the promise will result in NOTHING because function two returns NOTHING. Function three is never called
   *   //  Even if function two returns a promise that resolves in NOTHING 
   *   ((result2 = asyncResult2(0))===constants.NOTHING)?
   *     console.error("One returned a promise so I should get a promise")
   *     :
   *     result2.then((result)=>console.log("Did we get a Promise resulting in NOTHING:",result === constants.NOTHING));
   * 
   * });
   */

var util = {
	compose: function () {
		var operations = [].slice.call(arguments)
		  .filter((fn) => (typeof fn === "function" || util.throw("Arguments passed to compose need to be a function")))
		  , next = function (fn) {
		  	return function (arg) {
		  		if (arg === constants.NOTHING) {
		  			return arg;
		  		}
		  		else if (arg && typeof arg.then === "function") {
		  			return arg
					  .then((result) => {
					  	return (result === constants.NOTHING) ? result : fn(result);
					  });
		  		}
		  		return fn(arg);
		  	}
		  };
		return function (arg) {
			return operations
			  .map((fn) => next(fn))
			  .reduce((result, op) => op(result)
			  , arg);
		}
	},
	/**
	 * composeAsync is the same as util.compose but it guarantees to return a promise. 
	 *   Util.compose does not guarantee a promise as it can return NOTHING
	 * Here is the util.compose example that could return 
	 **/
	composeAsync: function () {
		return util.compose.apply(
		  null,
		  [
			function (args) {
				return Promise.resolve(args);
			}
		  ].concat([].slice.apply(arguments))
		);
	}
	/**
	 * You will notice that compose only takes one argument. A method can receive multiple arguments
	 *   the next function in the composed function will receive the result as the resultIndex argument
	 * This function takes an array of functions (just like compose and composeAsync)
	 *   argIndex is the index of of the argument of the next function (this will be set with the result of the current function)
	 *   async is by default false but if you pass a true value the result will be a promise that can result in NOTHING
	 *     depending on the functions you pass
	 */
  , composeVariableArguments: function(fn, argIndex,async){
  	var composeFunction = async ? util.composeAsync : util.compose;
  	return function(){
  		var args = [].slice.call(arguments)
		,next = function(fn){
			return function(returnVal){
				args[argIndex] = returnVal
				return fn.apply({},args);
			}
		};
  		return composeFunction.apply(
		  {}
		  ,fn.map((fn,index)=>{
		  	return next(fn);
		  })
		)(args[argIndex]);
  	}
  }
	/**
	 * This is a shortcut to composeVariableArguments witht he async boolean to true
	 *   created to improve readability in business code
	 */
  , composeVariableArgumentsAsync: function (functions, resultIndex) {
  	return util.composeVariableArguments(functions,resultIndex,true);
  }
	/**
	 * This is a shortcut to composeVariableArguments
	 *   created to improve readability in business code
	 * Used for reducing where the first argument is the result of the preveous function
	 */
  , composeReducer: function (functions) {
  	return util.composeVariableArguments(functions,0,false);
  }
	/**
	 * This is a shortcut to composeVariableArguments with async to true
	 *   created to improve readability in business code
	 * Used for reducing where the first argument is the result of the preveous function
	 */
  , composeReducerAsync: function (functions) {
  	return util.composeVariableArguments(functions,0,true);
  }
}



//In constants


var id=" - 5054bb1a-d3c4-c11f-a31a-9e11465b1f04"
,c = {
  NOTHING:"NOTHING"+id
};

export var constants = c;
