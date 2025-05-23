"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import styles from './AddressManager.module.css';

// Cấu hình Map
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};
const center = {
  lat: 10.8231,  // Vị trí mặc định (TP.HCM)
  lng: 106.6297,
};

// Component quản lý địa chỉ
const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Các trường dữ liệu
  const [addressLine, setAddressLine] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  
  // Tải Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
    libraries: ['places'],
  });

  // Load địa chỉ đã lưu từ localStorage khi component mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem('savedAddresses');
    if (savedAddresses) {
      try {
        setAddresses(JSON.parse(savedAddresses));
      } catch (error) {
        console.error("Error parsing saved addresses:", error);
      }
    }
  }, []);

  // Callback khi bản đồ load xong
  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Callback khi searchbox load xong
  const onSearchBoxLoad = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  // Callback khi tìm kiếm địa chỉ
  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      
      if (places.length === 0) {
        return;
      }
      
      const place = places[0];
      
      // Cập nhật vị trí bản đồ
      if (map) {
        map.panTo(place.geometry.location);
        map.setZoom(16);
      }
      
      // Lưu địa điểm đã chọn
      setSelectedPlace(place);
      
      // Điền thông tin vào form
      fillAddressForm(place);
    }
  };

  // Điền thông tin địa chỉ vào form
  const fillAddressForm = (place) => {
    let addressComponents = {};
    
    // Trích xuất thông tin từ các thành phần địa chỉ
    for (const component of place.address_components || []) {
      const type = component.types[0];
      addressComponents[type] = component.long_name;
    }
    
    // Điền vào form
    setAddressLine(`${addressComponents.street_number || ''} ${addressComponents.route || ''}`);
    setCity(addressComponents.locality || '');
    setState(addressComponents.administrative_area_level_1 || '');
    setZipCode(addressComponents.postal_code || '');
    setCountry(addressComponents.country || '');
  };

  // Lưu địa chỉ mới
  const saveAddress = () => {
    if (!selectedPlace || !addressLine) {
      alert("Vui lòng chọn một địa chỉ hợp lệ");
      return;
    }
    
    const newAddress = {
      id: Date.now(),  // ID đơn giản dựa trên timestamp
      formattedAddress: selectedPlace.formatted_address,
      addressLine,
      apt,
      city,
      state,
      zipCode,
      country,
      location: {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      }
    };
    
    // Thêm địa chỉ mới vào danh sách
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    
    // Lưu vào localStorage
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    
    // Reset form
    resetForm();
    
    alert("Đã lưu địa chỉ thành công!");
  };

  // Xóa địa chỉ
  const deleteAddress = (id) => {
    const updatedAddresses = addresses.filter(address => address.id !== id);
    setAddresses(updatedAddresses);
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
  };

  // Chọn địa chỉ đã lưu để hiển thị
  const selectAddress = (address) => {
    setCurrentAddress(address);
    
    // Cập nhật bản đồ
    if (map && address.location) {
      map.panTo(address.location);
      map.setZoom(16);
    }
    
    // Điền thông tin vào form
    setAddressLine(address.addressLine);
    setApt(address.apt);
    setCity(address.city);
    setState(address.state);
    setZipCode(address.zipCode);
    setCountry(address.country);
    
    // Đặt selectedPlace để có thể lưu lại
    setSelectedPlace({
      formatted_address: address.formattedAddress,
      geometry: {
        location: {
          lat: () => address.location.lat,
          lng: () => address.location.lng
        }
      }
    });
  };

  // Reset form
  const resetForm = () => {
    setAddressLine("");
    setApt("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("");
    setSelectedPlace(null);
    setCurrentAddress(null);
  };

  // Xử lý lỗi khi load Map API
  if (loadError) return <div className={styles.error}>Lỗi khi tải Google Maps</div>;
  if (!isLoaded) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.addressManager}>
      <h2>Quản lý địa chỉ</h2>
      <p className={styles.subtitle}>Lưu các địa chỉ giao hàng của bạn để đặt hàng dễ dàng hơn</p>
      
      <div className={styles.splitLayout}>
        <div className={styles.formPanel}>
          <div className={styles.header}>
            <img className={styles.titleIcon} src="https://fonts.gstatic.com/s/i/googlematerialicons/location_pin/v5/24px.svg" alt="" />
            <span className={styles.title}>Thêm địa chỉ mới</span>
          </div>

          <div className={styles.autocompleteContainer}>
            <StandaloneSearchBox
              onLoad={onSearchBoxLoad}
              onPlacesChanged={onPlacesChanged}
            >
              <input
                type="text"
                className={styles.input}
                placeholder="Tìm địa chỉ..."
              />
            </StandaloneSearchBox>
          </div>

          <input
            type="text"
            className={styles.input}
            placeholder="Địa chỉ"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
          />

          <input
            type="text"
            className={styles.input}
            placeholder="Căn hộ, Số phòng, v.v. (tùy chọn)"
            value={apt}
            onChange={(e) => setApt(e.target.value)}
          />
          
          <input
            type="text"
            className={styles.input}
            placeholder="Thành phố"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          
          <div className={styles.halfInputContainer}>
            <input
              type="text"
              className={`${styles.input} ${styles.halfInput}`}
              placeholder="Tỉnh/Thành"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <input
              type="text"
              className={`${styles.input} ${styles.halfInput}`}
              placeholder="Mã bưu điện"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>
          
          <input
            type="text"
            className={styles.input}
            placeholder="Quốc gia"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          
          <button className={styles.saveButton} onClick={saveAddress}>
            Lưu địa chỉ
          </button>

          {/* Hiển thị danh sách địa chỉ đã lưu */}
          {addresses.length > 0 && (
            <div className={styles.savedAddresses}>
              <h3>Địa chỉ đã lưu</h3>
              <ul className={styles.addressList}>
                {addresses.map((address) => (
                  <li key={address.id} className={styles.addressItem}>
                    <div 
                      className={`${styles.addressContent} ${currentAddress?.id === address.id ? styles.activeAddress : ''}`}
                      onClick={() => selectAddress(address)}
                    >
                      <p className={styles.formattedAddress}>{address.formattedAddress}</p>
                      <p>{address.addressLine}, {address.city}, {address.state} {address.zipCode}</p>
                    </div>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => deleteAddress(address.id)}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className={styles.mapContainer}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={center}
            onLoad={onMapLoad}
          >
            {/* Marker cho địa chỉ hiện tại */}
            {(currentAddress?.location || (selectedPlace?.geometry?.location)) && (
              <Marker
                position={
                  currentAddress?.location || 
                  {
                    lat: selectedPlace.geometry.location.lat(),
                    lng: selectedPlace.geometry.location.lng()
                  }
                }
              />
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
};

export default AddressManager; 