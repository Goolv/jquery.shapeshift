// Generated by CoffeeScript 1.4.0
(function() {

  (function($, window, document, undefined_) {
    var Plugin, defaults, pluginName;
    pluginName = "shapeshift";
    defaults = {
      enableResize: true,
      state: 'default',
      states: {
        "default": {
          "class": 'default_state',
          animated: true,
          animateSpeed: 200,
          staggerInit: true,
          staggerSpeed: 200,
          grid: {
            align: 'center',
            columns: null,
            colWidth: null,
            gutter: [10, 10]
          },
          style: {
            marginLeft: 0,
            marginTop: 0,
            opacity: 1
          },
          init_style: {
            marginLeft: -200,
            marginTop: -20,
            opacity: 0
          }
        }
      }
    };
    Plugin = function(element, options) {
      this.options = $.extend({}, defaults, options);
      this.grid = {};
      this.$container = $(element);
      this.children = [];
      this.stagger_queue = [];
      this.stagger_interval = null;
      this.state = null;
      return this.init();
    };
    Plugin.prototype = {
      init: function() {
        this._setState();
        this._enableFeatures();
        this._parseChildren();
        this._initializeGrid();
        return this._arrange();
      },
      insert: function($child, i) {
        if (i === void 0) {
          i = 999999;
        }
        this.$container.append($child);
        this._parseChild($child, i);
        this._calculateGrid();
        return this._arrange();
      },
      insertMany: function(children) {
        var $child, child_count, i, index, _i;
        child_count = children.length;
        for (i = _i = 0; 0 <= child_count ? _i < child_count : _i > child_count; i = 0 <= child_count ? ++_i : --_i) {
          $child = children[i][0];
          index = children[i][1] || 999999;
          this.$container.append($child);
          this._parseChild($child, index);
        }
        this._calculateGrid();
        return this._arrange();
      },
      _enableFeatures: function() {
        if (this.options.enableResize) {
          return this.enableResize();
        }
      },
      _setState: function(state) {
        if (state == null) {
          state = this.options.state;
        }
        return this.state = this.options.states[state];
      },
      _parseChildren: function() {
        var $child, $children, child_count, i, _i;
        $children = this.$container.children();
        child_count = $children.length;
        for (i = _i = 0; 0 <= child_count ? _i < child_count : _i > child_count; i = 0 <= child_count ? ++_i : --_i) {
          $child = $($children[i]);
          this._parseChild($child, i);
        }
        return this;
      },
      _parseChild: function($child, i) {
        return this.children.splice(i, 0, {
          el: $child,
          colspan: parseInt($child.attr("data-ss-colspan")) || 1,
          height: $child.outerHeight(),
          position: null,
          initialized: false
        });
      },
      _initializeGrid: function() {
        var fc_colspan, fc_width, first_child, grid_state, gutter_x, single_width;
        grid_state = this.state.grid;
        gutter_x = grid_state.gutter[0];
        if (grid_state.colWidth) {
          this.grid.col_width = grid_state.colWidth + gutter_x;
        } else {
          first_child = this.children[0];
          fc_width = first_child.el.outerWidth();
          fc_colspan = first_child.colspan;
          single_width = (fc_width - ((fc_colspan - 1) * gutter_x)) / fc_colspan;
          this.grid.col_width = single_width + gutter_x;
        }
        this.grid.padding_left = parseInt(this.$container.css("padding-left"));
        this.grid.padding_right = parseInt(this.$container.css("padding-right"));
        this.grid.padding_top = parseInt(this.$container.css("padding-top"));
        this.grid.padding_bottom = parseInt(this.$container.css("padding-bottom"));
        return this._calculateGrid();
      },
      _calculateGrid: function() {
        var child_offset, col_width, columns, container_inner_width, grid_state, grid_width;
        grid_state = this.state.grid;
        col_width = this.grid.col_width;
        container_inner_width = this.$container.width();
        columns = grid_state.columns || Math.floor(container_inner_width / col_width);
        if (columns > this.children.length) {
          columns = this.children.length;
        }
        this.grid.columns = columns;
        child_offset = this.grid.padding_left;
        grid_width = (columns * col_width) - grid_state.gutter[0];
        switch (grid_state.align) {
          case "center":
            child_offset += (container_inner_width - grid_width) / 2;
            break;
          case "right":
            child_offset += container_inner_width - grid_width;
        }
        return this.grid.child_offset = child_offset;
      },
      _arrange: function() {
        var $child, child, child_count, children, i, init_position, init_style, initialize, position, position_string, positions, stagger_init, stagger_queue, stagger_speed, state_style, _i;
        this._clearStaggerQueue();
        children = this.children;
        child_count = children.length;
        state_style = this.state.style;
        init_style = this.state.init_style;
        stagger_speed = this.state.staggerSpeed;
        stagger_init = this.state.staggerInit;
        stagger_queue = [];
        positions = this._getPositions();
        this.$container.css({
          height: this.grid.height
        });
        for (i = _i = 0; 0 <= child_count ? _i < child_count : _i > child_count; i = 0 <= child_count ? ++_i : --_i) {
          child = children[i];
          $child = child.el;
          position = positions[i];
          position_string = JSON.stringify(position);
          initialize = !child.initialized;
          if (initialize) {
            init_position = $.extend({}, position, init_style);
            $child.css(init_position);
            child.initialized = true;
          }
          if (position_string !== child.position) {
            $.extend(position, state_style);
            if (initialize) {
              stagger_queue.push([$child, position]);
            } else {
              this._move($child, position);
            }
            child.position = position_string;
          }
        }
        if (stagger_queue.length) {
          this._staggerMove(stagger_queue);
        }
        return this;
      },
      _staggerMove: function(stagger_queue) {
        var delay, i, state_class,
          _this = this;
        state_class = this.state["class"];
        delay = this.state.staggerSpeed;
        i = 0;
        this.stagger_queue = stagger_queue;
        return this.stagger_interval = setInterval(function() {
          var $child, child, position;
          child = stagger_queue[i];
          if (child) {
            $child = child[0];
            position = child[1];
            $child.addClass(state_class);
            _this._move($child, position);
            return i++;
          } else {
            clearInterval(_this.stagger_interval);
            return _this.stagger_interval = null;
          }
        }, delay);
      },
      _clearStaggerQueue: function() {
        var $child, child, child_count, i, position, stagger_queue, state_class, _i;
        clearInterval(this.stagger_interval);
        this.stagger_interval = null;
        stagger_queue = this.stagger_queue;
        if (stagger_queue.length) {
          child_count = stagger_queue.length;
          state_class = this.state["class"];
          for (i = _i = 0; 0 <= child_count ? _i < child_count : _i > child_count; i = 0 <= child_count ? ++_i : --_i) {
            child = stagger_queue[i];
            $child = child[0];
            position = child[1];
            $child.addClass(state_class);
            this._move($child, position);
          }
          return this.stagger_queue = [];
        }
      },
      _move: function($child, position) {
        return $child.css(position);
      },
      _getPositions: function() {
        var child, child_count, children, col, col_heights, col_width, columns, gutter_y, i, left, offset_left, padding_top, positions, states, top, _i, _j;
        children = this.children;
        col_width = this.grid.col_width;
        gutter_y = this.state.grid.gutter[1];
        padding_top = this.grid.padding_top;
        states = this.states;
        col_heights = [];
        columns = this.grid.columns;
        for (i = _i = 0; 0 <= columns ? _i < columns : _i > columns; i = 0 <= columns ? ++_i : --_i) {
          col_heights.push(padding_top);
        }
        positions = [];
        child_count = children.length;
        offset_left = this.grid.child_offset;
        for (i = _j = 0; 0 <= child_count ? _j < child_count : _j > child_count; i = 0 <= child_count ? ++_j : --_j) {
          child = children[i];
          col = this.lowestCol(col_heights);
          left = (col * col_width) + offset_left;
          top = col_heights[col];
          positions.push({
            left: left,
            top: top
          });
          col_heights[col] += child.height + gutter_y;
        }
        this.grid.height = this.highestCol(col_heights) - gutter_y - padding_top;
        return positions;
      },
      lowestCol: function(array) {
        return $.inArray(Math.min.apply(window, array), array);
      },
      highestCol: function(array) {
        return array[$.inArray(Math.max.apply(window, array), array)];
      },
      enableResize: function() {
        var resizing,
          _this = this;
        resizing = false;
        return $(window).on("resize", function() {
          var speed;
          if (!resizing) {
            speed = 200;
            resizing = true;
            setTimeout(function() {
              _this._calculateGrid();
              return _this._arrange();
            }, speed * .6);
            return setTimeout(function() {
              _this._calculateGrid();
              _this._arrange();
              return resizing = false;
            }, speed * 1.1);
          }
        });
      }
    };
    return $.fn[pluginName] = function(options) {
      var args, returns, scoped_name;
      args = arguments;
      scoped_name = "plugin_" + pluginName;
      if (options === undefined || typeof options === "object") {
        return this.each(function() {
          if (!$.data(this, scoped_name)) {
            return $.data(this, scoped_name, new Plugin(this, options));
          }
        });
      } else if (typeof options === "string" && options[0] !== "_" && options !== "init") {
        returns = void 0;
        this.each(function() {
          var instance;
          instance = $.data(this, scoped_name);
          if (instance instanceof Plugin && typeof instance[options] === "function") {
            returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
          }
          if (options === "destroy") {
            return $.data(this, scoped_name, null);
          }
        });
        if (returns !== undefined) {
          return returns;
        } else {
          return this;
        }
      }
    };
  })(jQuery, window, document);

}).call(this);
