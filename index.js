Ext.override(Rally.ui.grid.TreeGrid, {
    _mergeColumnConfigs: function(newColumns, oldColumns) {

        var mergedColumns = _.map(newColumns, function(newColumn) {
            var oldColumn = _.find(oldColumns, { dataIndex: this._getColumnName(newColumn) });
            if (oldColumn) {
                return this._getColumnConfigFromColumn(oldColumn);
            }

            return newColumn;
        }, this);
        if (this.config && this.config.derivedColumnCfgs) {
            mergedColumns = mergedColumns.concat(this.config.derivedColumnCfgs);
        }
        return mergedColumns;
    },

    _getColumnConfigsBasedOnCurrentOrder: function(columnConfigs) {
        var cols = _(this.headerCt.items.getRange()).map(function(column) {
            //override:  Added additional search for column.text
            return _.contains(columnConfigs, column.dataIndex) ? column.dataIndex : _.find(columnConfigs, { xtype: column.xtype, text: column.text });
        }).compact().value();

        return cols;
    },

    _restoreColumnOrder: function(columnConfigs) {

        var currentColumns = this._getColumnConfigsBasedOnCurrentOrder(columnConfigs);
        var addedColumns = _.filter(columnConfigs, function(config) {
            return !_.find(currentColumns, { dataIndex: config.dataIndex }) || Ext.isString(config);
        });

        return currentColumns.concat(addedColumns);
    },

    _applyStatefulColumns: function(columns) {
        // TODO (tj) test default columns
        if (this.alwaysShowDefaultColumns) {
            _.each(this.columnCfgs, function(columnCfg) {
                if (!_.any(columns, { dataIndex: this._getColumnName(columnCfg) })) {
                    columns.push(columnCfg);
                }
            }, this);
        }

        if (this.config && this.config.derivedColumnCfgs) {
            // Merge the derived column config with the stateful column if the dataIndex is the same,
            // Otherwise add the derived columns if they aren't present.
            //this.columnCfgs = columns.concat(this.config.derivedColumnCfgs);
            _.each(this.config.derivedColumnCfgs, function(derivedColumnCfg) {
                // Search by dataIndex or text
                var columnName = this._getColumnName(derivedColumnCfg);
                var columnState = _.find(columns, function(value) {
                    return (value.dataIndex === columnName || value.text === columnName);
                });
                if (columnState) {
                    // merge them (add renderer)
                    _.merge(columnState, derivedColumnCfg);
                }
                else {
                    // insert the derived column at the end
                    columns.push(derivedColumnCfg);
                }
            }, this);
        }

        this.columnCfgs = columns;
    },

    // derived columns likely don't use Rally.data.wsapi.Field, and don't have getUUID.
    // This override tests for getUUID function BEFORE calling it
    _getPersistableColumnConfig: function(column) {
        var columnConfig = this._getColumnConfigFromColumn(column),
            field = this._getModelField(columnConfig.dataIndex);
        if (field && field.getUUID) {
            columnConfig.dataIndex = field.getUUID();
        }
        return columnConfig;
    },

    /**
     * Override to support template columns that don't use a dataIndex
     */
    _getColumnName: function(column) {
        var result = '';
        if (_.isString(column)) {
            result = column;
        }
        else if (column && column.dataIndex) {
            result = column.dataIndex;
        }
        else if (column && column.text) {
            result = column.text;
        }
        return result;
    },
});
