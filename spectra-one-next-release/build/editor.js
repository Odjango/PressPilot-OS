/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/components/radioButton.js":
/*!*********************************************!*\
  !*** ./src/admin/components/radioButton.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SwtRadioButton: () => (/* binding */ SwtRadioButton)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);




const SwtRadioButton = _ref => {
  let {
    setting,
    setSetting,
    id,
    setData,
    notice,
    label
  } = _ref;
  const handleOnChange = (0,react__WEBPACK_IMPORTED_MODULE_2__.useCallback)(() => {
    setSetting({
      ...setting,
      [id]: !setting[id]
    });
    setData({
      ...setting,
      [id]: !setting[id]
    });
    (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.dispatch)('core/notices').createNotice('success',
    // Can be one of: success, info, warning, error.
    notice,
    // Text string to display.
    {
      type: 'snackbar',
      isDismissible: true // Whether the user can dismiss the notice.
    });
  }, [setting]);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToggleControl, {
    label: label,
    checked: setting[id],
    onChange: handleOnChange
  })));
};

/***/ }),

/***/ "./src/admin/settings.js":
/*!*******************************!*\
  !*** ./src/admin/settings.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_edit_site__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/edit-site */ "@wordpress/edit-site");
/* harmony import */ var _wordpress_edit_site__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_edit_site__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_icons_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/icons.js */ "./src/components/icons.js");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_radioButton_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/radioButton.js */ "./src/admin/components/radioButton.js");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_8__);









const SwtPluginSidebar = () => {
  const [settings, setSettings] = (0,react__WEBPACK_IMPORTED_MODULE_8__.useState)({
    scroll_top: false
  });
  const restEditorPanelUrl = 'swt/v1/global_settings';

  // Store data into database
  const setData = async setting => {
    const sendData = {
      setting
    };
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7___default()({
        path: restEditorPanelUrl,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-WP-NONCE': spectraOne.nonce
        },
        body: JSON.stringify(sendData)
      });
    } catch (error) {}
  };

  // Get data into database
  const getData = async () => {
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_7___default()({
        path: restEditorPanelUrl,
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'X-WP-NONCE': spectraOne.nonce
        }
      });
      if (response) {
        setSettings(response);
      }
    } catch (error) {}
  };

  // Only run once.
  (0,react__WEBPACK_IMPORTED_MODULE_8__.useEffect)(() => {
    getData();
  }, []);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_edit_site__WEBPACK_IMPORTED_MODULE_2__.PluginSidebar, {
    name: "swt-editor-sidebar",
    icon: _components_icons_js__WEBPACK_IMPORTED_MODULE_4__["default"].logo,
    isPinnable: true,
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Spectra Global Settings', 'spectra-one')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Global features', 'spectra-one'),
    initialOpen: true,
    className: 'swt-global-features-panel'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_radioButton_js__WEBPACK_IMPORTED_MODULE_6__.SwtRadioButton, {
    setting: settings,
    setSetting: setSettings,
    id: 'scroll_top',
    setData: setData,
    notice: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Scroll to top updated', 'spectra-one'),
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Scroll To Top', 'spectra-one')
  }))));
};
(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__.registerPlugin)('swt-editor-sidebar', {
  render: SwtPluginSidebar
});

/***/ }),

/***/ "./src/block-extensions/header.js":
/*!****************************************!*\
  !*** ./src/block-extensions/header.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HeaderSettings: () => (/* binding */ HeaderSettings)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__);







const HeaderSettings = props => {
  let SWTStickyHeader;
  let SWTTransparentHeader;
  if (props.hasOwnProperty('setAttributes')) {
    SWTStickyHeader = props?.attributes?.SWTStickyHeader && props.attributes.SWTStickyHeader ? true : false;
    SWTTransparentHeader = props?.attributes?.SWTTransparentHeader && props.attributes.SWTTransparentHeader ? true : false;
  } else {
    SWTStickyHeader = props?.meta._swt_meta_sticky_header && props.meta._swt_meta_sticky_header ? true : false;
    SWTTransparentHeader = props?.meta._swt_meta_transparent_header && props.meta._swt_meta_transparent_header ? true : false;
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, !SWTTransparentHeader && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Enable Sticky Header', 'spectra-one'),
    help: SWTStickyHeader ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Transparent header option will be disabled on enabling this option.', 'spectra-one') : '',
    checked: SWTStickyHeader,
    onChange: val => {
      return props.hasOwnProperty('setAttributes') ? props.setAttributes({
        SWTStickyHeader: !SWTStickyHeader
      }) : props.setMetaFieldValue(val, '_swt_meta_sticky_header');
    }
  })), !SWTStickyHeader && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Enable Transparent Header', 'spectra-one'),
    help: SWTTransparentHeader ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Sticky header option will be disabled on enabling this option.', 'spectra-one') : '',
    checked: SWTTransparentHeader,
    onChange: val => {
      return props.hasOwnProperty('setAttributes') ? props.setAttributes({
        SWTTransparentHeader: !SWTTransparentHeader
      }) : props.setMetaFieldValue(val, '_swt_meta_transparent_header');
    }
  })));
};
const Header = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(BlockEdit => {
  return props => {
    const {
      attributes,
      name
    } = props;
    if (attributes?.tagName && 'header' === attributes.tagName && 'core/template-part' === name) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockEdit, props), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: "Header Settings",
        initialOpen: true
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(HeaderSettings, props)))));
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockEdit, props));
  };
}, 'Header');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.addFilter)('editor.BlockEdit', 'swt/header', Header);
function HeaderAttributes(settings) {
  const includeBlock = ['core/template-part'];
  if (includeBlock.includes(settings.name)) {
    if (settings.attributes) {
      settings.attributes = Object.assign(settings.attributes, {
        SWTStickyHeader: {
          type: 'boolean',
          default: false
        },
        SWTTransparentHeader: {
          type: 'boolean',
          default: false
        }
      });
    }
  }
  return settings;
}
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.addFilter)('blocks.registerBlockType', 'swt/header-attributes', HeaderAttributes);
const HeaderCss = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(BlockListBlock => {
  return props => {
    const {
      name,
      attributes
    } = props;
    const includeBlock = ['core/template-part'];
    if (includeBlock.includes(name)) {
      const {
        SWTTransparentHeader
      } = attributes;
      const transparentHeaderCss = `
				.block-editor-block-list__block.swt-transparent-header {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					z-index: 999;
					margin-top: 0;
				}

				.swt-transparent-header > .has-background {
					background: transparent !important;
				}
			`;
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, SWTTransparentHeader && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("style", null, transparentHeaderCss), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, {
        className: `${props?.className ? `${props.className} ` : ''}${SWTTransparentHeader ? 'swt-transparent-header ' : ''}`
      })));
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, props));
  };
}, 'HeaderCss');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.addFilter)('editor.BlockListBlock', 'swt/header-css', HeaderCss);

/***/ }),

/***/ "./src/block-extensions/index.js":
/*!***************************************!*\
  !*** ./src/block-extensions/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _header_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./header.js */ "./src/block-extensions/header.js");
/* harmony import */ var _responsive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./responsive.js */ "./src/block-extensions/responsive.js");



/***/ }),

/***/ "./src/block-extensions/responsive.js":
/*!********************************************!*\
  !*** ./src/block-extensions/responsive.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__);








// if not excluded then it causes render error as adding custom attributes to these blocks are prohibited.
const excludeBlock = ['core/archives', 'core/calendar', 'core/latest-comments', 'core/tag-cloud', 'core/rss'];
const Responsive = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(BlockEdit => {
  return props => {
    const {
      attributes,
      name,
      setAttributes
    } = props;
    // Adding compatibility with spectra plugin. So the slugs are same as the plugin.
    const {
      SWTHideDesktop,
      SWTHideTab,
      SWTHideMob
    } = attributes;
    if (name && name.includes('core/') && !excludeBlock.includes(name)) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockEdit, props), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Panel, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: "Responsive Settings",
        initialOpen: true
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Hide Desktop', 'spectra-one'),
        checked: SWTHideDesktop,
        onChange: () => setAttributes({
          SWTHideDesktop: !SWTHideDesktop
        })
      })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Hide Tablet', 'spectra-one'),
        checked: SWTHideTab,
        onChange: () => setAttributes({
          SWTHideTab: !SWTHideTab
        })
      })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Hide Mobile', 'spectra-one'),
        checked: SWTHideMob,
        onChange: () => setAttributes({
          SWTHideMob: !SWTHideMob
        })
      }))))));
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockEdit, props));
  };
}, 'Responsive');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.addFilter)('editor.BlockEdit', 'swt/responsive', Responsive);
function ResponsiveAttributes(settings) {
  const {
    name,
    attributes
  } = settings;
  if (name && name.includes('core/') && !excludeBlock.includes(name)) {
    if (attributes) {
      settings.attributes = Object.assign(attributes, {
        SWTHideDesktop: {
          type: 'boolean',
          default: false
        },
        SWTHideTab: {
          type: 'boolean',
          default: false
        },
        SWTHideMob: {
          type: 'boolean',
          default: false
        }
      });
    }
  }
  return settings;
}
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.addFilter)('blocks.registerBlockType', 'swt/responsive-attributes', ResponsiveAttributes);
const responsiveCss = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(BlockListBlock => {
  return props => {
    const {
      name,
      attributes
    } = props;
    if (name && name.includes('core/') && !excludeBlock.includes(name)) {
      const {
        SWTHideDesktop,
        SWTHideTab,
        SWTHideMob
      } = attributes;
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, {
        className: `${props?.className ? `${props.className} ` : ''}${SWTHideDesktop ? 'swt-hide-desktop ' : ''}${SWTHideTab ? 'swt-hide-tablet ' : ''}${SWTHideMob ? 'swt-hide-mobile ' : ''}`
      })));
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, props));
  };
}, 'responsiveCss');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.addFilter)('editor.BlockListBlock', 'swt/responsive-css', responsiveCss);

/***/ }),

/***/ "./src/blocks/index.js":
/*!*****************************!*\
  !*** ./src/blocks/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _latest_post_list_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./latest-post-list.js */ "./src/blocks/latest-post-list.js");


/***/ }),

/***/ "./src/blocks/latest-post-list.js":
/*!****************************************!*\
  !*** ./src/blocks/latest-post-list.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);




const latestPostList = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(BlockListBlock => {
  return props => {
    const {
      name,
      attributes
    } = props;
    if (name !== 'core/latest-posts') {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, props);
    }
    const {
      displayFeaturedImage
    } = attributes;
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(BlockListBlock, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, {
      className: `${props?.className ? `${props.className} ` : ''}${displayFeaturedImage ? 'swt-has-featured-image ' : ''}`
    }));
  };
}, 'latestPostList');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.addFilter)('editor.BlockListBlock', 'swt/latest-post-list', latestPostList);

/***/ }),

/***/ "./src/components/icons.js":
/*!*********************************!*\
  !*** ./src/components/icons.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);

const SwtIcons = {
  logo: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    className: "swt-page-settings-button",
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 70 70",
    fill: "none"
  }, ' ', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M35 70C54.33 70 70 54.33 70 35C70 15.67 54.33 0 35 0C15.67 0 0 15.67 0 35C0 54.33 15.67 70 35 70ZM24.4471 23.5112C18.9722 26.7403 20.2852 35.3759 26.5032 37.0351L36.8875 39.806C37.7533 40.037 37.91 41.224 37.135 41.6811L27.0972 47.5799L26.036 58L45.5529 46.4888C51.0278 43.2597 49.7148 34.6241 43.4968 32.9649L33.1125 30.1941C32.2467 29.963 32.09 28.776 32.865 28.3189L42.9028 22.4202L43.964 12L24.4471 23.5112Z"
  }), ' ')
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SwtIcons);

/***/ }),

/***/ "./src/components/install-plugin-notice.js":
/*!*************************************************!*\
  !*** ./src/components/install-plugin-notice.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _plugin_helpers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./plugin-helpers.js */ "./src/components/plugin-helpers.js");





const SwtPluginInstallNotice = () => {
  const {
    activationUrl,
    pluginSlug,
    pluginStatus
  } = spectraOne;

  // Initializing empty object to store text
  let currentTextObject = [];

  // Text object if plugin is only installed and not activated
  if (pluginStatus !== 'activated' && pluginStatus === 'installed') {
    currentTextObject = {
      initialText: 'Activate Spectra',
      progressText: 'Activating Spectra...',
      errorText: 'Error activating Spectra',
      SuccessText: 'Spectra Activated'
    };
  }

  // Text object if plugin is not installed
  if (pluginStatus !== 'installed' && pluginStatus !== 'activated') {
    currentTextObject = {
      initialText: 'Install & Activate Spectra',
      progressText: 'Installing & Activating Spectra...',
      errorText: 'Error installing Spectra',
      SuccessText: 'Spectra Installed & Activated'
    };
  }

  // Destructuring set object to access variables directly
  const {
    initialText,
    progressText,
    errorText,
    SuccessText
  } = currentTextObject;

  // Sets button state to change button behaviour accordingly
  const [buttonState, setButtonState] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);

  // Sets button inner text
  const [buttonText, setButtonText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(initialText);

  // Sets button state disable or re-enable button
  const [disableButton, setDisableButton] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);

  // Function to activate plugin
  const activatePlugin = async pluginInitSlug => {
    // Setting up post request to activate plugin
    const reqResponse = await (0,_plugin_helpers_js__WEBPACK_IMPORTED_MODULE_4__.activatePluginUrl)(pluginInitSlug);
    if (true === reqResponse.success) {
      // Shows the users that the plugin is successfully installed and reloads the page
      setButtonState(false);
      setButtonText(SuccessText);
      location.reload();
    } else {
      // Shows the user that there an error has occured
      setButtonText(errorText);
      setButtonState(false);

      // Resets state so that the user can retry again
      setTimeout(() => {
        setButtonText(SuccessText);
        setButtonState(false);
        setDisableButton(false);
      }, 2000);
    }
  };

  // Handles on click to install set plugin
  const handleSubmit = async (slug, pluginInit) => {
    // Checks if button disabled so that the button can be only clicked once
    if (false === disableButton) {
      // Sets all required useStates
      setButtonText(progressText);
      setButtonState(true);
      setDisableButton(true);

      // Checks if plugin is only installed and not activated
      if (pluginStatus !== 'activated' && pluginStatus === 'installed') {
        // Activates the set plugin
        activatePlugin(pluginInit);
      } else {
        try {
          // Gets the plugin files if not downloaded
          await (0,_plugin_helpers_js__WEBPACK_IMPORTED_MODULE_4__.installPlugin)(slug);

          // Activates the set plugin
          activatePlugin(pluginInit);
        } catch (e) {
          // If the plugin is already downloaded then this check that and activates the set plugin
          if ('folder_exists' === e.errorCode) {
            // Activates the set plugin
            activatePlugin(pluginInit);
          }
        }
      }
    }
  };
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Spectra plugin', 'spectra-one'),
    initialOpen: true
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Power-up your website with advanced and powerful blocks that help you build websites in no time!', 'spectra-one')), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
    className: `swt-full-width-btn ${true === buttonState ? 'is-busy ' : ''} `,
    onClick: () => handleSubmit(pluginSlug, activationUrl),
    isPrimary: true,
    "aria-disabled": disableButton
  }, buttonText));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SwtPluginInstallNotice);

/***/ }),

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

/***/ }),

/***/ "./src/extensions/editor/index.js":
/*!****************************************!*\
  !*** ./src/extensions/editor/index.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _title_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./title.js */ "./src/extensions/editor/title.js");


/***/ }),

/***/ "./src/extensions/editor/title.js":
/*!****************************************!*\
  !*** ./src/extensions/editor/title.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);

window.addEventListener('load', function () {
  swtSiteTitle();
});
function swtSiteTitle() {
  /* Do things after DOM has fully loaded */

  (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.subscribe)(function () {
    setTimeout(function () {
      const editorStylesWrapper = document.querySelector('.editor-styles-wrapper');
      if (null !== editorStylesWrapper) {
        const editorStylesWrapperWidth = parseInt(editorStylesWrapper.offsetWidth);
        if (editorStylesWrapperWidth < 1350) {
          editorStylesWrapper.classList.remove('swt-stacked-title-visibility');
          editorStylesWrapper.classList.add('swt-stacked-title-visibility');
        } else {
          editorStylesWrapper.classList.remove('swt-stacked-title-visibility');
        }
      }

      // Title visibility with new editor compatibility update.
      const titleVisibility = document.querySelector('.title-visibility');
      const titleBlock = document.querySelector('.edit-post-visual-editor__post-title-wrapper');
      if (null === titleVisibility && null !== titleBlock) {
        let titleVisibilityTrigger = '';
        if ((0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/editor').getEditedPostAttribute('meta')?._swt_meta_site_title_display && true === (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/editor').getEditedPostAttribute('meta')._swt_meta_site_title_display) {
          titleVisibilityTrigger = '<span class="dashicons dashicons-hidden title-visibility" data-tooltip="Enable Title"></span>';
          titleBlock.classList.toggle('invisible');
        } else {
          titleVisibilityTrigger = '<span class="dashicons dashicons-visibility title-visibility" data-tooltip="Disable Title"></span>';
        }
        titleBlock.insertAdjacentHTML('beforeend', titleVisibilityTrigger);
        document.querySelector('.title-visibility').addEventListener('click', function () {
          titleBlock.classList.toggle('invisible');
          if (this.classList.contains('dashicons-hidden')) {
            this.classList.add('dashicons-visibility');
            this.classList.remove('dashicons-hidden');
            this.dataset.tooltip = 'Disable Title';
            (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/editor').editPost({
              meta: {
                _swt_meta_site_title_display: false
              }
            });
          } else {
            this.classList.add('dashicons-hidden');
            this.classList.remove('dashicons-visibility');
            this.dataset.tooltip = 'Enable Title';
            (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/editor').editPost({
              meta: {
                _swt_meta_site_title_display: true
              }
            });
          }
        });
      }

      // Show post/page title wrapper outline & eye icon only when clicked.
      const titleInput = document.querySelector('.editor-post-title__input');
      const visibilityIcon = document.querySelector('.title-visibility');
      if (null !== titleInput && null !== visibilityIcon) {
        document.addEventListener('click', function (event) {
          if (!titleBlock.contains(event.target)) {
            visibilityIcon.classList.remove('swt-show-visibility-icon');
            titleInput.classList.remove('swt-show-editor-title-outline');
          }
        });
        document.addEventListener('visibilitychange', function () {
          visibilityIcon.classList.remove('swt-show-visibility-icon');
          titleInput.classList.remove('swt-show-editor-title-outline');
        });
        titleBlock.addEventListener('focusout', function () {
          visibilityIcon.classList.remove('swt-show-visibility-icon');
          titleInput.classList.remove('swt-show-editor-title-outline');
        });
        titleBlock.addEventListener('click', function () {
          visibilityIcon.classList.add('swt-show-visibility-icon');
          titleInput.classList.add('swt-show-editor-title-outline');
        });
        titleInput.addEventListener('input', function () {
          visibilityIcon.classList.add('swt-show-visibility-icon');
          this.classList.add('swt-show-editor-title-outline');
        });
      }
      const responsivePreview = document.querySelectorAll('.is-tablet-preview, .is-mobile-preview');
      if (responsivePreview.length) {
        document.body.classList.add('responsive-enabled');
      } else {
        document.body.classList.remove('responsive-enabled');
      }
    }, 1);
  });
}

/***/ }),

/***/ "./src/extensions/panel/components.js":
/*!********************************************!*\
  !*** ./src/extensions/panel/components.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SwtComponents: () => (/* binding */ SwtComponents)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _block_extensions_header__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../block-extensions/header */ "./src/block-extensions/header.js");
/* harmony import */ var _components_install_plugin_notice_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/install-plugin-notice.js */ "./src/components/install-plugin-notice.js");






const SwtComponents = props => {
  const disableSections = Object.entries(spectraOne.disable_sections).map(_ref => {
    let [key, value] = _ref;
    const sectionValue = props?.meta[value.key] && props.meta[value.key] ? true : false;
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelRow, {
      key: key
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
      key: key,
      label: value.label,
      checked: sectionValue,
      onChange: val => {
        props.setMetaFieldValue(val, value.key);
      }
    }));
  });
  const panelBody = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Disable Elements', 'spectra-one'),
    initialOpen: true,
    className: 'swt-disable-elements-panel'
  }, disableSections), !props?.meta?._swt_meta_header_display && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Header Settings', 'spectra-one'),
    initialOpen: true,
    className: 'swt-header-settings-panel'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_block_extensions_header__WEBPACK_IMPORTED_MODULE_4__.HeaderSettings, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, spectraOne.header_settings))), spectraOne.pluginStatus !== 'activated' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_components_install_plugin_notice_js__WEBPACK_IMPORTED_MODULE_5__["default"], props));
  return panelBody;
};

/***/ }),

/***/ "./src/extensions/panel/sidebar.js":
/*!*****************************************!*\
  !*** ./src/extensions/panel/sidebar.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_edit_post__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/edit-post */ "@wordpress/edit-post");
/* harmony import */ var _wordpress_edit_post__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_edit_post__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _components_icons_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/icons.js */ "./src/components/icons.js");
/* harmony import */ var _components_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components.js */ "./src/extensions/panel/components.js");

/**
 * Meta Options build.
 */






const SwtSidebar = props => {
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_edit_post__WEBPACK_IMPORTED_MODULE_1__.PluginSidebarMoreMenuItem, {
    target: "swt-page-settings-panel",
    icon: _components_icons_js__WEBPACK_IMPORTED_MODULE_5__["default"].logo
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Spectra Page Settings', 'spectra-one')), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_edit_post__WEBPACK_IMPORTED_MODULE_1__.PluginSidebar, {
    isPinnable: true,
    icon: _components_icons_js__WEBPACK_IMPORTED_MODULE_5__["default"].logo,
    name: "swt-page-settings-panel",
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Spectra Page Settings', 'spectra-one'),
    className: 'swt-sidebar'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_js__WEBPACK_IMPORTED_MODULE_6__.SwtComponents, props)));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.compose)((0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.withSelect)(select => {
  const postMeta = select('core/editor').getEditedPostAttribute('meta');
  const oldPostMeta = select('core/editor').getCurrentPostAttribute('meta');
  return {
    meta: {
      ...oldPostMeta,
      ...postMeta
    },
    oldMeta: oldPostMeta
  };
}), (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.withDispatch)(dispatch => ({
  setMetaFieldValue: (value, field) => dispatch('core/editor').editPost({
    meta: {
      [field]: value
    }
  })
})))(SwtSidebar));

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/edit-post":
/*!**********************************!*\
  !*** external ["wp","editPost"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["editPost"];

/***/ }),

/***/ "@wordpress/edit-site":
/*!**********************************!*\
  !*** external ["wp","editSite"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["editSite"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/plugins":
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["plugins"];

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/extends.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/extends.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _extends)
/* harmony export */ });
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/*!***********************!*\
  !*** ./src/editor.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _extensions_panel_sidebar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./extensions/panel/sidebar */ "./src/extensions/panel/sidebar.js");
/* harmony import */ var _extensions_panel_components_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./extensions/panel/components.js */ "./src/extensions/panel/components.js");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _extensions_editor_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./extensions/editor/index.js */ "./src/extensions/editor/index.js");
/* harmony import */ var _block_extensions_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./block-extensions/index.js */ "./src/block-extensions/index.js");
/* harmony import */ var _blocks_index_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./blocks/index.js */ "./src/blocks/index.js");
/* harmony import */ var _admin_settings_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./admin/settings.js */ "./src/admin/settings.js");









if (spectraOne.is_spectra_plugin) {
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_4__.addFilter)('spectra.page-sidebar.before', 'swt/setting-list', function (markup, props) {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, markup, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_extensions_panel_components_js__WEBPACK_IMPORTED_MODULE_3__.SwtComponents, props));
  }, 10);
}
if (!spectraOne.is_spectra_plugin) {
  (0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__.registerPlugin)('swt-page-level-settings', {
    render: _extensions_panel_sidebar__WEBPACK_IMPORTED_MODULE_2__["default"]
  });
}
})();

/******/ })()
;
//# sourceMappingURL=editor.js.map