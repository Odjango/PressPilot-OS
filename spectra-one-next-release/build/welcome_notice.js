/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/plugin-helpers.js":
/*!******************************************!*\
  !*** ./src/components/plugin-helpers.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activatePluginUrl: () => (/* binding */ activatePluginUrl),
/* harmony export */   installPlugin: () => (/* binding */ installPlugin)
/* harmony export */ });
async function installPlugin(slug) {
  return new Promise(resolve => {
    wp.updates.ajax('install-plugin', {
      slug,
      success: () => {
        resolve({
          success: true
        });
      },
      error: err => {
        resolve({
          success: false,
          code: err.errorCode
        });
      }
    });
  });
}
async function activatePluginUrl(url) {
  try {
    const reqResponse = await fetch(url);
    if (200 === reqResponse.status) {
      return {
        success: true
      };
    }
  } catch (err) {
    return {
      success: false
    };
  }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************************!*\
  !*** ./src/admin/welcome-notice.js ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_plugin_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/plugin-helpers.js */ "./src/components/plugin-helpers.js");

document.addEventListener('DOMContentLoaded', () => {
  handleWelcomeNotice();
});
function handleWelcomeNotice() {
  const {
    activating,
    installing,
    done,
    activationUrl,
    ajaxUrl,
    pluginSlug,
    nonce,
    pluginStatus
  } = spectraOne;
  let installStatusText;
  const CloseButton = document.querySelector('.swt-welcome-notice .notice-dismiss');
  const WelcomeNoticeContainer = document.querySelector('.swt-welcome-notice');
  const InstallButton = document.querySelector('.swt-welcome-notice #swt-install-spectra');
  if (InstallButton) {
    installStatusText = InstallButton.querySelector('.text');
  }
  const hideAndRemoveNotice = () => {
    if (WelcomeNoticeContainer) {
      WelcomeNoticeContainer.remove();
    }
  };
  const activateSpectra = async () => {
    installStatusText.textContent = activating;
    await (0,_components_plugin_helpers_js__WEBPACK_IMPORTED_MODULE_0__.activatePluginUrl)(activationUrl);
    InstallButton.classList.remove('updating-message');
    InstallButton.classList.add('updated-message');
    installStatusText.textContent = done;
    setTimeout(hideAndRemoveNotice, 2000);
  };
  if (InstallButton) {
    InstallButton.addEventListener('click', async () => {
      InstallButton.classList.add('updating-message');
      InstallButton.classList.add('disabled');
      if (pluginStatus === 'installed') {
        await activateSpectra();
        return;
      }
      installStatusText.textContent = installing;
      await (0,_components_plugin_helpers_js__WEBPACK_IMPORTED_MODULE_0__.installPlugin)(pluginSlug);
      await activateSpectra();
    });
  }
  CloseButton.addEventListener('click', async () => {
    const res = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: `action=swt_dismiss_welcome_notice&nonce=${nonce}`
    };
    try {
      const reqResponse = await fetch(ajaxUrl, res);
      if (200 === reqResponse.status) {
        hideAndRemoveNotice();
      }
    } catch (err) {}
  });
}
})();

/******/ })()
;
//# sourceMappingURL=welcome_notice.js.map