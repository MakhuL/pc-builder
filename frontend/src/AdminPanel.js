import React, { useEffect, useState } from 'react';
import './AdminPanel.css';

const schema = {
  processors: ['name', 'cores', 'threads', 'base_clock', 'socket', 'tdp', 'price'],
  gpus: ['name', 'gpu_memory', 'base_clock', 'boost_clock', 'tdp', 'type', 'length', 'price'],
  rams: ['name', 'size', 'speed', 'ram_type', 'price'],
  storage: ['name', 'capacity', 'type', 'interface', 'price'],
  motherboards: ['name', 'socket', 'chipset', 'form_factor', 'ram_type', 'price'],
  psus: ['name', 'wattage', 'efficiency', 'modular', 'price'],
  cases: ['name', 'form_factor', 'max_gpu_length', 'max_cooler_height', 'price'],
};

function AdminPanel() {
  const [category, setCategory] = useState('processors');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const apiUrl = `http://localhost:3001/${category}`;

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch(apiUrl);
      const data = await res.json();
      setItems(data);
    };

    fetchItems();

    const empty = {};
    schema[category].forEach((f) => {
      empty[f] = f === 'modular' ? false : '';
    });
    setNewItem(empty);
  }, [category, apiUrl]);

  const handleAdd = async () => {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const res = await fetch(apiUrl);
    const data = await res.json();
    setItems(data);
  };

  const handleDelete = async (id) => {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    const res = await fetch(apiUrl);
    const data = await res.json();
    setItems(data);
  };

  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setEditedItem({ ...item });
  };

  const handleSave = async () => {
    await fetch(`${apiUrl}/${editingItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedItem),
    });
    setEditingItemId(null);
    const res = await fetch(apiUrl);
    const data = await res.json();
    setItems(data);
  };

  return (
    <div className="admin-panel">
      <h2>Панель адміністратора</h2>

      <select onChange={(e) => setCategory(e.target.value)} value={category}>
        {Object.keys(schema).map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <h3>Додати новий компонент</h3>
      <div className="form-row">
        {schema[category].map((field) => (
          <input
            key={field}
            type={typeof newItem[field] === 'boolean' ? 'checkbox' : 'text'}
            value={typeof newItem[field] === 'boolean' ? undefined : newItem[field] || ''}
            checked={typeof newItem[field] === 'boolean' ? newItem[field] : undefined}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                [field]:
                  typeof newItem[field] === 'boolean'
                    ? e.target.checked
                    : e.target.value,
              })
            }
            placeholder={field}
          />
        ))}
        <button onClick={handleAdd}>Додати</button>
      </div>

      <h3>Список компонентів</h3>
      <ul className="component-list">
        {items.map((item) => (
          <li key={item.id}>
            {editingItemId === item.id ? (
              <>
                {schema[category].map((field) => (
                  <input
                    key={field}
                    type={typeof editedItem[field] === 'boolean' ? 'checkbox' : 'text'}
                    value={typeof editedItem[field] === 'boolean' ? undefined : editedItem[field] || ''}
                    checked={typeof editedItem[field] === 'boolean' ? editedItem[field] : undefined}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
                        [field]:
                          typeof editedItem[field] === 'boolean'
                            ? e.target.checked
                            : e.target.value,
                      })
                    }
                  />
                ))}
                <button onClick={handleSave}>Зберегти</button>
              </>
            ) : (
              <>
                <span>{schema[category].map((field) => item[field]).join(' | ')}</span>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(item)}>Редагувати</button>
                  <button onClick={() => handleDelete(item.id)}>Видалити</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
