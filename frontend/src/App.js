// === frontend/App.js === 
import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import AdminPanel from './AdminPanel';
import Verify from './Verify';

const categories = ['processors', 'gpus', 'rams', 'storage', 'motherboards', 'psus', 'cases'];

const categoryToKey = {
  processors: 'processor',
  gpus: 'gpu',
  rams: 'ram',
  storage: 'storage',
  motherboards: 'motherboard',
  psus: 'psu',
  cases: 'case',
};

function MainApp() {
  const [components, setComponents] = useState({});
  const [sortDirection, setSortDirection] = useState({});
  const [visibleSections, setVisibleSections] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [searchTerms, setSearchTerms] = useState({});
  const [socketFilters, setSocketFilters] = useState({});

  const [build, setBuild] = useState({
    processor: null,
    gpu: null,
    ram: null,
    storage: null,
    motherboard: null,
    psu: null,
    case: null,
  });

  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const fetched = {};
      const sortInit = {};
      const visibleInit = {};
      const searchInit = {};
      const socketInit = {};
      for (const cat of categories) {
        const res = await fetch(`http://localhost:3001/${cat}`);
        fetched[cat] = await res.json();
        sortInit[cat] = 'none';
        visibleInit[cat] = false;
        searchInit[cat] = '';
        socketInit[cat] = '';
      }
      setComponents(fetched);
      setSortDirection(sortInit);
      setVisibleSections(visibleInit);
      setSearchTerms(searchInit);
      setSocketFilters(socketInit);
    };
    fetchAll();
  }, []);

  const toggleVisibility = (category) => {
    setVisibleSections(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const chooseComponent = (category, component) => {
    setBuild(prev => ({ ...prev, [categoryToKey[category]]: component }));
  };

  const removeComponent = (categoryKey) => {
    setBuild(prev => ({ ...prev, [categoryKey]: null }));
  };

  const resetBuild = () => {
    const emptyBuild = Object.fromEntries(Object.keys(build).map(k => [k, null]));
    setBuild(emptyBuild);
    setWarnings([]);
  };

  const totalPrice = Object.values(build)
    .filter(Boolean)
    .reduce((sum, comp) => sum + (comp.price || 0), 0);

  const selectedCount = Object.values(build).filter(Boolean).length;

  const checkCompatibility = (currentBuild) => {
    const warnings = [];
    const { processor, motherboard, ram, gpu, case: pcCase, psu } = currentBuild;
    if (processor && motherboard && processor.socket !== motherboard.socket) {
      warnings.push('❌ Процесор і материнська плата мають різні сокети');
    }
    if (ram && motherboard && ram.ram_type !== motherboard.ram_type) {
      warnings.push('❌ Оперативна памʼять несумісна з материнською платою (тип памʼяті)');
    }
    if (gpu && pcCase && gpu.length > pcCase.max_gpu_length) {
      warnings.push('❌ Відеокарта не влазить у корпус (занадто довга)');
    }
    if (processor && gpu && psu) {
      const estimatedLoad = processor.tdp + gpu.tdp + 100;
      const requiredWattage = Math.ceil(estimatedLoad * 1.2);
      if (psu.wattage < requiredWattage) {
        warnings.push(`❌ Блоку живлення не вистачає потужності. Потрібно щонайменше ${requiredWattage} Вт`);
      }
    }
    return warnings;
  };

  useEffect(() => {
    setWarnings(checkCompatibility(build));
  }, [build]);

  const handleSortChange = (category, criteria) => {
    let sorted = [...components[category]];
    if (criteria === 'asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criteria === 'desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (criteria === 'priceLow') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (criteria === 'priceHigh') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (criteria === 'socket' && (category === 'processors' || category === 'motherboards')) {
      sorted.sort((a, b) => (a.socket || '').localeCompare(b.socket || ''));
    }
    setComponents(prev => ({ ...prev, [category]: sorted }));
    setSortDirection(prev => ({ ...prev, [category]: criteria }));
  };

  const logout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setRole(null);
  };

  const renderComponentList = (category, label) => {
    const filtered = components[category]?.filter(comp => {
      const term = searchTerms[category]?.toLowerCase() || '';
      const socket = socketFilters[category]?.toLowerCase() || '';
      const matchesName = !term || comp.name.toLowerCase().includes(term);
      const matchesSocket = !socket || (comp.socket && comp.socket.toLowerCase().includes(socket));
      return matchesName && matchesSocket;
    });

    return (
      <div className="component-category fade-section">
        <h2 className="category-header" onClick={() => toggleVisibility(category)}>
          {label} {visibleSections[category] ? '▼' : '▶'}
        </h2>
        <div style={{ maxHeight: visibleSections[category] ? '1000px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
          {visibleSections[category] && (
            <>
              <input
                type="text"
                placeholder="Пошук за назвою"
                value={searchTerms[category] || ''}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, [category]: e.target.value }))}
              />
              {(category === 'processors' || category === 'motherboards') && (
                <input
                  type="text"
                  placeholder="Фільтр по сокету"
                  value={socketFilters[category] || ''}
                  onChange={(e) => setSocketFilters(prev => ({ ...prev, [category]: e.target.value }))}
                />
              )}
              <select
                value={sortDirection[category]}
                onChange={(e) => handleSortChange(category, e.target.value)}
                className="sort-select"
              >
                <option value="none">Не сортувати</option>
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
                <option value="priceLow">Ціна: від дешевших</option>
                <option value="priceHigh">Ціна: від дорожчих</option>
                {(category === 'processors' || category === 'motherboards') && <option value="socket">Сортувати за сокетом</option>}
              </select>
              <ul className="component-list">
                {filtered.map(comp => (
                  <li
                    key={comp.id}
                    className={`component-item ${build[categoryToKey[category]]?.id === comp.id ? 'selected-item' : ''}`}
                  >
                    <span className="no-wrap">{comp.name} - {comp.price}$</span>
                    <button
                      className="choose-button"
                      onClick={() => chooseComponent(category, comp)}
                    >
                      Обрати
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!role) {
    return <Login onLogin={(r) => setRole(r)} />;
  }

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      {role === 'admin' && <div className="admin-panel-wrapper"><AdminPanel /></div>}
      <div className="main-content">
        <h1 className="title">Обери свої комплектуючі</h1>
        {renderComponentList('processors', 'Процесори')}
        {renderComponentList('gpus', 'Відеокарти')}
        {renderComponentList('rams', 'Оперативна памʼять')}
        {renderComponentList('storage', 'Накопичувачі')}
        {renderComponentList('motherboards', 'Материнські плати')}
        {renderComponentList('psus', 'Блоки живлення')}
        {renderComponentList('cases', 'Корпуси')}
      </div>
      <div className="build-summary sidebar">
        <h2>ПК Конфігуратор</h2>
        <p>Роль: {role}</p>
        <button onClick={logout} className="reset-button">Вийти</button>
        <button onClick={() => setDarkMode(!darkMode)} className="toggle-theme-button">
          {darkMode ? 'Світла тема' : 'Темна тема'}
        </button>
        <button onClick={resetBuild} className="reset-button">Очистити збірку</button>
        <div className="selected-count">Обрано: {selectedCount} / 7</div>
        <h3 className="compatibility-title">Сумісність:</h3>
        {warnings.length === 0 ? <p className="success-msg">✅ Усі компоненти сумісні</p> : (
          <ul className="warning-list">
            {warnings.map((warn, index) => <li key={index}>{warn}</li>)}
          </ul>
        )}
        <h3 className="build-title">Ваша збірка:</h3>
        <ul className="build-list">
          {Object.entries(build).map(([key, comp]) => comp && (
            <li key={key}>
              <span className="no-wrap">
                {key.charAt(0).toUpperCase() + key.slice(1)}: {comp.name} - {comp.price}$
              </span>
              <button
                className="remove-button"
                onClick={(e) => {
                  const li = e.target.closest('li');
                  if (li) {
                    li.classList.add('removing');
                    setTimeout(() => {
                      removeComponent(key);
                      setVisibleSections(prev => ({ ...prev, [key + 's']: true }));
                    }, 300);
                  }
                }}
              >
                Видалити
              </button>
            </li>
          ))}
        </ul>
        <h3 className="total-price">Загальна вартість: {totalPrice}$</h3>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;