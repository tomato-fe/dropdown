;!function ($) {
    'use strict';
    var flag = '[data-ui="dropdown"]';
    var select = '[data-ui="dropdown"] [data-role="item"]';
    
    var Dropdown = function (element) {
        $(element).attr('data-ui', 'dropdown');
    }

    Dropdown.version = '0.1.0'
    /**
     * 展开或者收起
     */
    Dropdown.prototype.toggle = function(e) {
        
        var $this = $(this);
        if ($this.is('.disabled')) return;

        var isActive = $this.hasClass('open');

        clearList();

        if (!isActive) {
            var relatedTarget = { relatedTarget: this }
            $this.trigger(e = $.Event('show.tc.dropdown', relatedTarget)); 

            if (e.isDefaultPrevented()) return;

            $this
                .addClass('open')
                .trigger($.Event('shown.tc.dropdown', relatedTarget));
            return false;
        }
    };    

    /**
     * 更新数据源  [{value:'value1', text: 'text1', selected: true, disabled: true}]
     */
    Dropdown.prototype.syncModel = function(model) {
        if (model && model.length) {
            var $this = $(this);
            var $list = $this.children('.ui-dropdown-list');
            var selected, items = [];

            model.forEach(function(el) {
                var $a = $('<a href="#" data-role="item"></a>');
                $a
                    .data('value', el.value)
                    .data('selected', el.selected)
                    .data('disabled', el.disabled)
                    .html(el.text)
                items.push($a);
                if (el.selected) selected = el;
                if (el.disabled) $a.addClass('disabled');
            });
            selected = selected || model[0];
            getRoleValue($this)
                .html(selected.text)
                .data('value', selected.value)
            $list.empty().append(items);
        }
    };

    /**
     * 禁用选择器
     */
    Dropdown.prototype.disabled = function() {
        var $this = $(this);
        if ($this.hasClass('.disabled')) return;
        $this.addClass('disabled').data('disabled', true);
    };

    /**
     * 选择某项目
     *
     * index(number) / value (string)
     */
    Dropdown.prototype.selected = function(index) {
        var $this = $(this),
            $list = $this.children('.ui-dropdown-list'),
            $item
            
        index = index === void 0 ? 0 : index
        if (typeof index === 'number') {
            // index
            $item = $list.children('[data-role="item"]').eq(index)
            _selectedItem($item)
        }
        else {
            index = index + ''
            $list.children('[data-role="item"]').each(function() {
                $item = $(this)
                if (  ''+$item.data('value') === index) {
                    _selectedItem($item)
                    return false
                }
            });
        }
    };

    /**
     * 获取值
     */
    Dropdown.prototype.getValue = function() {
        return getRoleValue( $(this) ).data('value') || ''
    }

    function getParent($item) {
        return $item.closest('.ui-dropdown');
    }  

    function getRoleValue($parent) {
        return $parent.find('[data-role="value"]')
    }

    function _selectedItem($item) {
        var opt = {
            value: $item.data('value'),
            text: $item.text()
        }
        var $parent = getParent($item);
        var $roleValue = getRoleValue($parent);
        var prev = $roleValue.data('value') === undefined ? '' : $roleValue.data('value');
        var $input = $parent.children('[type=hidden]:first')

         opt.value = opt.value === undefined ? '' : opt.value

        $roleValue
            .html(opt.text)
            .data('value', opt.value)

        if ($input.length) {
            $input.val(opt.value)
        }

        // change 事件
        if (prev !== opt.value) {
            var relatedTarget = { relatedTarget: this }
            $parent.trigger($.Event('change.tc.dropdown', relatedTarget), [opt.value, prev]);

            if ($input.length) {
                // 触发原生change事件
                _fireEvent($input[0], 'change')
            }
        }
    }

    function _fireEvent(target, type) {
        if (document.createEvent) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent(type, false, true);  
            target.dispatchEvent(ev);
        } else {
            var eventObj = document.createEventObject();
            eventObj.target = target
            target.fireEvent("on"+ type, eventObj);
        }
    }

    //项目选择
    function itemSelect(e) {
        var $item = $(this);
        if ($item.is('.disabled') || $item.data('disabled')) return false;
        _selectedItem($item)
    }

    //清除下拉
    function clearList(e) {
        $(flag).each(function () {
            var $this = $(this)
            var relatedTarget = { relatedTarget: this }
            if (!$this.hasClass('open')) return;

            $this.trigger(e = $.Event('hide.tc.dropdown', relatedTarget)); 

            if (e.isDefaultPrevented()) return;

            $this
                .removeClass('open')
                .trigger($.Event('hiden.tc.dropdown', relatedTarget));
        });
    }

    // PLUG 定义
    // ==========================
    function Plugin(option, params) {
        var ret
        this.each(function () {
            var $this = $(this);
            var data  = $this.data('tc.dropdown');

            if (!data) $this.data('tc.dropdown', (data = new Dropdown(this)) );

            if (typeof option === 'string') 
                ret = data[option].call($this, params)
        });

        return ret === undefined ? this : ret


    }

    $.fn.dropdown = Plugin;
    $.fn.dropdown.Constructor = Dropdown;


    // 绑定默认
    // ===================================
    $(document)
        .on('click.tc.dropdown', clearList)
        .on('click.tc.dropdown', select, itemSelect)
        .on('click.tc.dropdown', flag, Dropdown.prototype.toggle)
}(jQuery);
