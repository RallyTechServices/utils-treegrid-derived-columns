# @agile-central-technical-services/utils-treegrid-derived-columns

![This is a screenshot](https://github.com/RallyTechServices/utils-treegrid-derived-columns/raw/master/screenshot.png)

This module provides overrides for a Rally.ui.grid.TreeGridView that addes support for a `derivedColumnCfgs`
config that accepts column definitions that are "derived" from the model data, but are not a field
on the model itself. This can be because the columns use a dataIndex that was added to the data after load,
or because the column is a template column that renders without using a dataIndex.

This can also be used with a `rallygridboard` in `grid` mode.

In the screenshot, `Name` and `Release` are standard columns of the PortfolioItem, selected using the
`rallygridboardfieldpicker` plugin, the rest of the columns are "derived" based on calculations after the
portfolio items are loaded.

The derived column size and ordering will be saved and restored with the grid state.  They
will also cooporate with the `rallygridboardfieldpicker` plugin.  They won't show up in the field
picker, but will preserve the order among themselves and any fields added by the field picker.

## Installation
1. Install using npm (or yarn) `npm install @agile-central-technical-services/utils-treegrid-derived-columns`
2. Add the file to the `javascript` section of `config.json`
    ```
     "javascript": [
        "node_modules/@agile-central-technical-services/utils-treegrid-derived-columns/index.js",
        ...
    ```
## Example usage
```
addGrid: function() {
    this.add({
        xtype: 'rallygridboard',
        context: this.getContext(),
        modelNames: ['PortfolioItem/Theme']
        toggleState: 'grid',
        height: this.getHeight(),
        plugins: [
            {
                ptype: 'rallygridboardfieldpicker'
            }
        ],
        gridConfig: {
            store: store,
            columnCfgs: this.getColumnCfgs(),
            derivedColumnCfgs: this.getDerivedColumnCfgs()
        }
    });
},

getColumnCfgs: function() {
        // Currently mostly derived columns. The column picker will add other standard columns
        return ['FormattedID', 'Name'].concat(this.getDerivedColumnCfgs());
    },

getDerivedColumnCfgs: function() {
    var periodDays = Rally.getApp().getSetting(TsConstants.SETTINGS.PERIOD_LENGTH);
    return [{
        text: 'Feature Cycle Time - Overall Median (Days)',
        xtype: 'templatecolumn',
        tpl: new Ext.XTemplate(''),
        scope: this,
        renderer: function(value, meta, record) {
            return this.nanRenderer(record, 'CycleTimeMedian');
        }
    }, {
        text: 'Feature Cycle Time - Last ' + Ext.util.Format.plural(periodDays, 'Day', 'Days'),
        xtype: 'templatecolumn',
        tpl: new Ext.XTemplate(''),
        scope: this,
        renderer: function(value, meta, record) {
            return this.nanRenderer(record, 'CycleTimeCurrentPeriod');
        }
    }, {
        text: 'Feature Cycle Time - ' + periodDays + ' Day Trend',
        tpl: '{CycleTimeTrend}',
        xtype: 'templatecolumn',
        scope: this,
        renderer: function(value, meta, record) {
            return this.cycleTimeTrendRenderer(record, 'CycleTimeTrend');
        }
    }, {
        text: 'Feature Throughput - Last ' + Ext.util.Format.plural(periodDays, 'Day', 'Days'),
        xtype: 'templatecolumn',
        tpl: new Ext.XTemplate(''),
        scope: this,
        renderer: function(value, meta, record) {
            return this.nanRenderer(record, 'ThroughputMedian');
        }

    }, {
        text: 'Feature Throughput - ' + periodDays + ' Day Trend',
        tpl: '{ThroughputTrend}',
        xtype: 'templatecolumn',
        scope: this,
        renderer: function(value, meta, record) {
            return this.throughputTrendRenderer(record, 'ThroughputTrend');
        }
    }, {
        text: TsConstants.LABELS.WIP,
        xtype: 'templatecolumn',
        tpl: new Ext.XTemplate(''),
        scope: this,
        renderer: function(value, meta, record) {
            return this.wipRenderer(record);
        }
    }];
},
```

## Developer Notes
To Update
1. `npm version patch` - This will update the package.json to a new version and create a git tag (e.g. `v1.0.1`). It will also run the `postversion` script
to push the changes and tag to GitHub.
2. `npm publish --access public` - This will publish the new version to npmjs.org
3. Create the new release in [`utils-treegrid-derived-columns/releases'](https://github.com/RallyTechServices/utils-treegrid-derived-columns/releases)


