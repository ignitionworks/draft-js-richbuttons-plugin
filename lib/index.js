'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _StyleButton = require('./StyleButton');

var _StyleButton2 = _interopRequireDefault(_StyleButton);

var _BlockButton = require('./BlockButton');

var _BlockButton2 = _interopRequireDefault(_BlockButton);

var _draftJs = require('draft-js');

var _types = require('./config/types');

var _decorateComponentWithProps = require('decorate-component-with-props');

var _decorateComponentWithProps2 = _interopRequireDefault(_decorateComponentWithProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var richButtonsPlugin = function richButtonsPlugin(_ref) {
  var _ref$max_list_depth = _ref.max_list_depth;
  var max_list_depth = _ref$max_list_depth === undefined ? _types.DEFAULT_MAX_LIST_DEPTH : _ref$max_list_depth;
  var _ref$inline_styles = _ref.inline_styles;
  var inline_styles = _ref$inline_styles === undefined ? _types.DEFAULT_INLINE_STYLES : _ref$inline_styles;
  var _ref$block_types = _ref.block_types;
  var block_types = _ref$block_types === undefined ? _types.DEFAULT_BLOCK_TYPES : _ref$block_types;

  var store = {
    getEditorState: undefined,
    setEditorState: undefined,
    currentState: undefined,

    onChange: function onChange(newState) {
      if (newState !== this.currentState) {
        this.currentState = newState;
        this.notifyBound();
      }
      return newState;
    },

    // buttons must be subscribed explicitly to ensure rerender
    boundComponents: [],
    bindToState: function bindToState(component, remove) {
      if (remove) {
        this.boundComponents = this.boundComponents.filter(function (registered) {
          return registered !== component;
        });
      } else {
        this.boundComponents.push(component);
      }
    },
    notifyBound: function notifyBound() {
      this.boundComponents.forEach(function (component) {
        return component.forceUpdate();
      });
    },

    toggleInlineStyle: function toggleInlineStyle(inlineStyle) {
      var state = this.getEditorState();
      var newState = _draftJs.RichUtils.toggleInlineStyle(state, inlineStyle);
      this.setEditorState(newState);
    },

    toggleBlockType: function toggleBlockType(blockType) {
      var state = this.getEditorState();
      var newState = _draftJs.RichUtils.toggleBlockType(state, blockType);
      this.setEditorState(_draftJs.EditorState.forceSelection(newState, newState.getCurrentContent().getSelectionAfter()));
    }
  };

  var configured = {
    initialize: function initialize(_ref2) {
      var getEditorState = _ref2.getEditorState;
      var setEditorState = _ref2.setEditorState;

      store.currentState = getEditorState();
      store.getEditorState = function () {
        return store.currentState;
      };
      store.setEditorState = function (newState) {
        store.onChange(newState);
        setEditorState(newState);
      };
    },

    handleKeyCommand: function handleKeyCommand(command, _ref3) {
      var getEditorState = _ref3.getEditorState;
      var setEditorState = _ref3.setEditorState;

      var editorState = getEditorState();
      var newState = _draftJs.RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        setEditorState(newState);
        return true;
      }
      return false;
    },

    onTab: function onTab(event, _ref4) {
      var getEditorState = _ref4.getEditorState;
      var setEditorState = _ref4.setEditorState;

      var editorState = getEditorState();
      var newState = _draftJs.RichUtils.onTab(event, editorState, max_list_depth);

      if (newState !== editorState) {
        setEditorState(newState);
      }
    },

    onChange: function onChange(newState) {
      return store.onChange(newState);
    }
  };

  inline_styles.forEach(function (inlineStyle) {
    configured[inlineStyle.label.replace(' ', '_') + 'Button'] = (0, _decorateComponentWithProps2.default)(_StyleButton2.default, {
      store: store,
      bindToState: store.bindToState.bind(store),
      label: inlineStyle.label,
      inlineStyle: inlineStyle.style
    });
  });

  block_types.forEach(function (blockType) {
    configured[blockType.label.replace(' ', '_') + 'Button'] = (0, _decorateComponentWithProps2.default)(_BlockButton2.default, {
      store: store,
      bindToState: store.bindToState.bind(store),
      label: blockType.label,
      blockType: blockType.style
    });
  });

  return configured;
};

exports.default = richButtonsPlugin;