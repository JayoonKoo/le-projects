import React, {useCallback, useState} from 'react';
import './SortableList.css';
import SortableListItem from './SortableListItem';

function SortableList({data, onDropItem, onClickItem, renderItem}) {
  const [startIndex, setStartIndex] = useState(null);
  const [listData, setListData] = useState(data);

  const onDragStart = index => setStartIndex(index);

  const onDrop = useCallback(
    dropIndex => {
      const dragItem = listData[startIndex];
      let list = [...listData];
      list.splice(startIndex, 1);
      const newListData =
        startIndex < dropIndex
          ? [
              ...list.slice(0, dropIndex - 1),
              dragItem,
              ...list.slice(dropIndex - 1, list.length),
            ]
          : [
              ...list.slice(0, dropIndex),
              dragItem,
              ...list.slice(dropIndex, list.length),
            ];
      setListData(newListData);
      onDropItem(newListData);
    },
    [startIndex, onDropItem, listData],
  );

  return (
    <ul className="sortable-list">
      {listData.map((item, index) => (
        <SortableListItem
          key={index}
          index={index}
          draggable={true}
          onDragStart={onDragStart}
          onDropItem={onDrop}
          onClickItem={onClickItem}>
          {renderItem(item, index)}
        </SortableListItem>
      ))}
      <SortableListItem
        key={listData.length}
        index={listData.length}
        draggable={false}
        onDropItem={onDrop}
      />
    </ul>
  );
}

export default SortableList;
