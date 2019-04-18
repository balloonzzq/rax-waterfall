import {Component, createElement, useState} from 'rax';
import cloneElement from 'rax-clone-element';
import {isWeex} from 'universal-env';
import View from 'rax-view';
import ScrollView from 'rax-scrollview';
import RefreshControl from 'rax-refreshcontrol';

let styles = {
  waterfallWrap: {
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterfallColumn: {
  },
};

function Header(props) {
  if (isWeex) {
    return <header {...this.props} append="tree" />;
  } else {
    return <View {...this.props} />;
  }
};

function WebFall(props) {
  const {renderItem = () => {}, dataSource, columnCount = 1} = props;
  let columns = [];
  let moduleHeights = [];

  for (let i = 0; i < columnCount; i++) {
    columns[i] = [];
    moduleHeights[i] = 0;
  }

  dataSource && dataSource.forEach((item, i) => {
    let targetColumnIndex = 0;
    let minHeight = moduleHeights[0];

    for (let j = 0; j < columnCount; j++) {
      if (moduleHeights[j] < minHeight) {
        minHeight = moduleHeights[j];
        targetColumnIndex = j;
      }
    }

    moduleHeights[targetColumnIndex] += item.height;
    columns[targetColumnIndex].push(item);
  });

  return (<View style={styles.waterfallWrap}>
    {columns.map((column, index) => {
      return (<View key={'column' + index} style={styles.waterfallColumn}>
        {column.map((item, j) => {
          return renderItem(item, 'c_' + index + j);
        })}
      </View>);
    })}
  </View>);
}

function Waterfall(props) {
  const [loadmoreretry, setLoadmoreretry] = useState(0);
  let {
    renderHeader,
    renderFooter,
    columnWidth = 750,
    columnCount = 1,
    columnGap = 0,
    dataSource,
    cellProps,
    renderItem = () => {}
  } = props;
  let header = typeof renderHeader == 'function' ? renderHeader() : null;
  let footer = typeof renderFooter == 'function' ? renderFooter() : null;
  header = Array.isArray(header) ? header : [header];
  footer = Array.isArray(footer) ? footer : [footer];

  let cells = header.map((child, index) => {
    if (child) {
      if (child.type != RefreshControl && child.type != Header) {
        return <Header>{child}</Header>;
      } else {
        return cloneElement(child, {});
      }
    }
  });

  if (isWeex) {
    dataSource && dataSource.forEach((item, index) => {
      cells.push(<cell {...cellProps}>{renderItem(item, index)}</cell>);
    });
  } else {
    cells = cells.concat(<WebFall {...props} />);
  }
  cells = cells.concat(footer.map((child, index) => {
    if (child) {
      if (child.type != Header) {
        return <Header>{child}</Header>;
      } else {
        return cloneElement(child, {});
      }
    }
  }));

  if (isWeex) {
    return (<waterfall
      style={{width: 750}}
      {...props}
      onLoadmore={props.onEndReached}
      loadmoreoffset={props.onEndReachedThreshold}
      loadmoreretry={loadmoreretry}
    >
      {cells}
    </waterfall>);
  } else {
    styles.waterfallColumn.width = columnWidth;
    return (<ScrollView {...props}>
      {cells}
    </ScrollView>);
  }
};

Waterfall.Header = Header;

export default Waterfall;
