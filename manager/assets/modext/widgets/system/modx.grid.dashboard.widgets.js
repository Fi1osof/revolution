
MODx.grid.DashboardWidgets = function(config) {
    config = config || {};
    this.exp = new Ext.grid.RowExpander({
        tpl : new Ext.Template(
            '<p class="desc">{description_trans}</p>'
        )
    });

    this.sm = new Ext.grid.CheckboxSelectionModel();
    Ext.applyIf(config,{
        url: MODx.config.connector_url
        ,baseParams: {
            action: 'system/dashboard/widget/getlist'
        }
        ,fields: ['id','name','name_trans','description','description_trans','type','content','namespace','lexicon','size','cls']
        ,paging: true
        ,remoteSort: true
        ,sm: this.sm
        ,plugins: [this.exp]
        ,columns: [this.exp,this.sm,{
            header: _('id')
            ,dataIndex: 'id'
            ,width: 50
            ,sortable: true
        },{
            header: _('name')
            ,dataIndex: 'name_trans'
            ,width: 150
            ,sortable: true
            ,editable: false
        },{
            header: _('widget_type')
            ,dataIndex: 'type'
            ,width: 80
            ,sortable: true
        },{
            header: _('widget_namespace')
            ,dataIndex: 'namespace'
            ,width: 120
            ,sortable: true
        }]
        ,tbar: [{
            text: _('widget_create')
            ,handler: this.createDashboard
            ,scope: this
        },'-',{
            text: _('bulk_actions')
            ,menu: [{
                text: _('selected_remove')
                ,handler: this.removeSelected
                ,scope: this
            }]
        },'->',{
            xtype: 'textfield'
            ,name: 'search'
            ,id: 'modx-dashboard-widget-search'
            ,emptyText: _('search_ellipsis')
            ,listeners: {
                'change': {fn: this.search, scope: this}
                ,'render': {fn: function(cmp) {
                    new Ext.KeyMap(cmp.getEl(), {
                        key: Ext.EventObject.ENTER
                        ,fn: this.blur
                        ,scope: cmp
                    });
                },scope:this}
            }
        },{
            xtype: 'button'
            ,id: 'modx-dashboard-widgets-filter-clear'
            ,text: _('filter_clear')
            ,listeners: {
                'click': {fn: this.clearFilter, scope: this}
            }
        }]
    });
    MODx.grid.DashboardWidgets.superclass.constructor.call(this,config);
};
Ext.extend(MODx.grid.DashboardWidgets,MODx.grid.Grid,{
    getMenu: function() {
        var r = this.getSelectionModel().getSelected();
        var p = r.data.cls;

        var m = [];
        if (this.getSelectionModel().getCount() > 1) {
            m.push({
                text: _('selected_remove')
                ,handler: this.removeSelected
                ,scope: this
            });
        } else {
            if (p.indexOf('pupdate') != -1) {
                m.push({
                    text: _('widget_update')
                    ,handler: this.updateWidget
                });
            }
            if (p.indexOf('premove') != -1) {
                if (m.length > 0) m.push('-');
                m.push({
                    text: _('widget_unplace')
                    ,handler: this.removeWidget
                });
            }
        }
        if (m.length > 0) {
            this.addContextMenuItem(m);
        }
    }

    ,createDashboard: function() {
        MODx.loadPage('system/dashboards/widget/create');
    }
    ,removeSelected: function() {
        var cs = this.getSelectedAsList();
        if (cs === false) return false;

        MODx.msg.confirm({
            title: _('widget_remove_multiple')
            ,text: _('widget_remove_multiple_confirm')
            ,url: this.config.url
            ,params: {
                action: 'system/dashboard/widget/removeMultiple'
                ,widgets: cs
            }
            ,listeners: {
                'success': {fn:function(r) {
                    this.getSelectionModel().clearSelections(true);
                    this.refresh();
                },scope:this}
            }
        });
        return true;
    }

    ,removeWidget: function() {
        MODx.msg.confirm({
            title: _('widget_remove')
            ,text: _('widget_remove_confirm')
            ,url: this.config.url
            ,params: {
                action: 'system/dashboard/widget/remove'
                ,id: this.menu.record.id
            }
            ,listeners: {
            	'success': {fn:this.refresh,scope:this}
            }
        });
    }

    ,updateWidget: function() {
        MODx.loadPage('system/dashboards/widget/update', 'id='+this.menu.record.id);
    }
    ,search: function(tf,newValue,oldValue) {
        var nv = newValue || tf;
        this.getStore().baseParams.query = Ext.isEmpty(nv) || Ext.isObject(nv) ? '' : nv;
        this.getBottomToolbar().changePage(1);
        this.refresh();
        return true;
    }
    ,clearFilter: function() {
    	this.getStore().baseParams = {
            action: 'system/dashboard/widget/getlist'
    	};
        Ext.getCmp('modx-dashboard-widget-search').reset();
    	this.getBottomToolbar().changePage(1);
        this.refresh();
    }
});
Ext.reg('modx-grid-dashboard-widgets',MODx.grid.DashboardWidgets);
