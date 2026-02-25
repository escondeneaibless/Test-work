import './App.css';
import {
  Route,
  Link,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import { JSX,  useState, useEffect, useMemo  } from 'react';

interface Vehicle {
  id: number;
  name: string;
  model: string;
  year: number;
  color: string;
  price: number;
  latitude: number;
  longitude: number;
}

//сортировка полей Год и Цена производится по клику на заголовки

type VehicleData = Vehicle[];
function App(): JSX.Element {
  const [data, setData] = useState<VehicleData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, 'id'>>({
      name: '',
      model: '',
      year: 0,
      color: '',
      price: 0,
      latitude: 0,
      longitude: 0
    });
    const [sortConfig, setSortConfig] = useState<{
    key: keyof Vehicle | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc'
  });
    const requestSort = (key: keyof Vehicle) => {
    let direction: 'asc' | 'desc' = 'asc';
  
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
  
    setSortConfig({ key, direction });
  };
  const sortedData = useMemo(() => {
    if (!data || !sortConfig.key) return data;
  
    const sorted = [...data].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
    return sorted;
  }, [data, sortConfig]);
  
    useEffect(() => {
      setLoading(true);
      setError(null);
      fetch('https://task.tspb.su/test-task/vehicles')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((json: VehicleData) => {
          setData(json);
        })
        .catch((error: Error) => {
          console.error('Error fetching data:', error);
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }, []);
    const startEditing = (vehicle: Vehicle) => {
      setEditingVehicle({ ...vehicle });
    };
    const saveEdit = () => {
      if (!editingVehicle) return;
      setData(prev =>
        prev?.map(v => v.id === editingVehicle.id ? editingVehicle : v) || null
      );
      setEditingVehicle(null);
    };
    const cancelEdit = () => {
      setEditingVehicle(null);
    };
    const addVehicle = () => {
      const newId = data ? Math.max(...data.map(v => v.id)) + 1 : 1;
      const vehicle: Vehicle = { id: newId, ...newVehicle };
      setData(prev => prev ? [...prev, vehicle] : [vehicle]);
      setNewVehicle({
        name: '', model: '', year: 0, color: '', price: 0, latitude: 0, longitude: 0
      });
      setShowAddForm(false);
    };
    const deleteVehicle = (id: number) => {
      setData(prev => prev?.filter(v => v.id !== id) || null);
    };
    if (loading) {
      return <div>Загрузка...</div>;
    }
    if (error) {
      return <div>Ошибка: {error}</div>;
    }
    if (!data) {
      return <div>Нет данных</div>;
    }

  return (
    <div>
      <button onClick={() => setShowAddForm(true)} style={{ marginBottom: '10px' }}>
        Добавить новый автомобиль
      </button>

      {showAddForm && (
        <>
        <tr>
          <td></td>
          <td>Макрка</td>
          <td>Модель</td>
            <th
              onClick={() => requestSort('year')}
              style={{ cursor: 'pointer', userSelect: 'none', padding: '8px', border: '1px solid #ddd' }}
            >
              Год
              {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
            </th>
            <th>Цвет</th>
            <th
              onClick={() => requestSort('price')}
              style={{ cursor: 'pointer', userSelect: 'none', padding: '8px', border: '1px solid #ddd' }}
            >
              Цена
              {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
            </th>
        </tr>
        <tr>
          <td>Новый</td>
          <td><input value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} /></td>
          <td><input value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} /></td>
          <td><input type="number" value={newVehicle.year} onChange={e => setNewVehicle({ ...newVehicle, year: Number(e.target.value) })} /></td>
          <td><input value={newVehicle.color} onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })} /></td>
          <td><input type="number" value={newVehicle.price} onChange={e => setNewVehicle({ ...newVehicle, price: Number(e.target.value) })} /></td>
          <td>
            <button onClick={addVehicle}>Добавить</button>
            <button onClick={() => setShowAddForm(false)}>Отмена</button>
          </td>
        </tr>
        </>
      )}
      <table id="sortable-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Марка</th>
            <th>Модель</th>
             <th
      onClick={() => requestSort('year')}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >Год{sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
    </th>
    <th>Цвет</th>
    <th onClick={() => requestSort('price')} style={{ cursor: 'pointer', userSelect: 'none' }}>
      Цена{sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
    </th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sortedData?.map((vehicle) => (
            editingVehicle && editingVehicle.id === vehicle.id ? (
              <tr key={vehicle.id} style={{ backgroundColor: '#f0f8ff' }}>
                <td>{editingVehicle.id}</td>
                <td><input value={editingVehicle.name} onChange={e => setEditingVehicle({ ...editingVehicle, name: e.target.value })} style={{ width: '100%' }} /></td>
                <td><input value={editingVehicle.model} onChange={e => setEditingVehicle({ ...editingVehicle, model: e.target.value })} style={{ width: '100%' }} /></td>
                <td><input type="number" value={editingVehicle.year} onChange={e => setEditingVehicle({ ...editingVehicle, year: Number(e.target.value) })} style={{ width: '100%' }} /></td>
                <td><input value={editingVehicle.color} onChange={e => setEditingVehicle({ ...editingVehicle, color: e.target.value })} style={{ width: '100%' }} /></td>
                <td><input type="number" value={editingVehicle.price} onChange={e => setEditingVehicle({ ...editingVehicle, price: Number(e.target.value) })} style={{ width: '100%' }} /></td>
                <td>
                  <button onClick={saveEdit} style={{ marginRight: '5px' }}>Сохранить</button>
                  <button onClick={cancelEdit}>Отмена</button>
                </td>
              </tr>
            ) : (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.name}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.year}</td>
                <td>{vehicle.color}</td>
                <td>{vehicle.price}</td>
                <td><button onClick={() => startEditing(vehicle)} style={{ marginRight: '5px' }}>Редактировать</button>
                  <button onClick={() => deleteVehicle(vehicle.id)}>Удалить</button></td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}



const Root: React.FC = () => {
  return (
    <>
      <Outlet />
    </>
  );
};
export default App;