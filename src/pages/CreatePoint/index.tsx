import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Map from '../../MapsGoogle'
import api from '../../services/api'
import axios from 'axios';

import './styles.css'

import logo from '../../assets/logo.svg';


interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string
}


const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState({lat: 20, lng: 20});
    const [initialPosition, setInitialPosition] = useState({lat: 20, lng: 20});

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const history = useHistory();

    // (Função que fara a ação tomada), (Condições em que a ação ocorrerá)
    useEffect(() => {
        api.get('items')
            .then(response => {
                setItems(response.data);
            }
        );
    }, []); // Ao declararar o segundo parametro vazio, executa assim funciona como DidMount

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/')
            .then(response => {
                const ufInitials = response.data.map( uf => uf.sigla);

                setUfs(ufInitials);
            })
        
    }, []);

    useEffect(() => {
        if(selectedUf === '0') setCities(['0']);

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);

                setCities(cityNames);
            })

    }, [selectedUf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition({lat: latitude, lng: longitude});
        })
    }, []);

    useEffect(() => {
        setSelectedPosition(initialPosition);
    }, [initialPosition]);

    function handleSelectUf(e: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(e.target.value);
    }
    function handleSelectCity(e: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(e.target.value);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        
        setFormData({ ...formData, [name]: value} );
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems);
            
        } else {
            setSelectedItems([...selectedItems, id ]);
        }
    }

    function handlePositionClick (e: google.maps.MouseEvent) {
        setSelectedPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const {lat, lng} = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude: lat,
            longitude: lng,
            items
        };

        await api.post('points', data);

        alert('Ponto de coleta criado!');

        history.push('/');
    }


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="text"
                                name="email"
                                id="email"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map initialPosition={initialPosition} markPosition={selectedPosition} handleClick={handlePositionClick}/>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select value={selectedUf} name="uf" id="uf" onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected':''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
}

export default CreatePoint;