import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../style/SettingsPage.css';
import userIcon from "../assets/user.png";
import themeIcon from "../assets/themeIcon.png";
import generalIcon from "../assets/generalIcon.png";
import passwordIcon from "../assets/passwordIcon.png";
import notificationIcon from "../assets/notificationIcon.png";
import walletIcon from "../assets/walletIcon.png";
import deleteIcon from "../assets/deleteIcon.png";
import walletLargeIcon from "../assets/wallet-large.png";

export default function SettingsPage({ user, balance, setBalance, fetchBalance }) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'general');
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [topupAmount, setTopupAmount] = useState("");
    const [topupMessage, setTopupMessage] = useState("");

    useEffect(() => {
        if (location.state?.activeTab) {
        setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    async function handleTopup() {
        const amount = parseFloat(topupAmount);
        if (!amount || amount <= 0) return;
        const res = await fetch("https://localhost:7059/api/library/topup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ amount })
        });
        const data = await res.json();
        if (res.ok) {
        setBalance(data.balance);
        setTopupMessage(`Поповнено на ${amount}$`);
        setTopupAmount("");
        fetchBalance();
        setTimeout(() => setTopupMessage(""), 3000);
        }
    }

    const GeneralSettings = () => (
        <div className="settings-panel">
        <div className="settings-profile-header">
            <div className="settings-cover-placeholder"></div>
            <div className="settings-avatar-wrapper">
            <img src={user?.photo && user.photo !== "User.png" ? `https://localhost:7059/avatars/${user.photo}` : userIcon} alt="avatar" />
            </div>
        </div>
        <div className="settings-form">
            <div className="settings-row">
            <div className="settings-input-group">
                <label>Нікнейм</label>
                <input type="text" defaultValue={user?.username || "MrZubarik"} />
            </div>
            <div className="settings-input-group">
                <label>Ел. пошта</label>
                <input type="email" defaultValue={user?.email || "example@gmail.com"} />
            </div>
            </div>
            <div className="settings-input-group">
            <label>Про себе <span className="char-count">0/100</span></label>
            <textarea rows="3" defaultValue="Готовий до нових перемог! Кожна гра – це новий шанс довести свою майстерність та досягти нових вершин."></textarea>
            </div>
            <div className="settings-input-group half-width">
            <label>Мова сайту</label>
            <select defaultValue="uk">
                <option value="uk">🇺🇦 Українська</option>
                <option value="en">🇬🇧 English</option>
            </select>
            </div>
            <div className="settings-actions">
            <button className="btn-cancel">Скасувати</button>
            <button className="btn-save">Зберегти</button>
            </div>
        </div>
        </div>
    );

    const PasswordSettings = () => (
        <div className="settings-panel small-panel">
        <h2 className="panel-title">Зміна паролю</h2>
        <ul className="password-rules">
            <li>• Не використовуйте жодного з останніх 5 паролів</li>
            <li>• Використовуйте 7+ символів</li>
            <li>• Використовуйте принаймні 1 літеру</li>
            <li>• Використовуйте принаймні 1 цифру</li>
            <li>• Без пробілів</li>
        </ul>
        <div className="settings-form">
            <div className="settings-input-group">
            <label>Старий пароль</label>
            <input type="password" placeholder="Введіть ваш поточний пароль..." />
            </div>
            <div className="settings-input-group">
            <label>Новий пароль</label>
            <input type="password" placeholder="Введіть новий пароль..." />
            <input type="password" placeholder="Повторіть новий пароль..." style={{ marginTop: '10px' }} />
            </div>
            <div className="settings-actions center">
            <button className="btn-save">Зберегти</button>
            </div>
        </div>
        </div>
    );

    const NotificationSettings = () => (
        <div className="settings-panel">
        <h2 className="panel-title align-left">Беззвучні сповіщення</h2>
        <div className="toggle-list">
            {['Великий розпродаж', 'Знижка на ігри з мого Бажаного', 'Новий коментар під моїм профілем', 'Новий запит на дружбу', 'Мій запит на дружбу прийнято', 'Мій запит на дружбу відхилено'].map((item, i) => (
            <div className="toggle-row" key={i}>
                <span>{item}</span>
                <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
            </div>
            ))}
        </div>
        <h2 className="panel-title align-left" style={{ marginTop: '30px' }}>Чат</h2>
        <div className="toggle-row headers">
            <span></span>
            <div className="toggle-headers">
            <span>Сповіщення</span>
            <span>Звук</span>
            </div>
        </div>
        <div className="toggle-row">
            <span>Нове повідомлення у чаті</span>
            <div className="toggle-group">
            <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
            <label className="toggle-switch"><input type="checkbox" defaultChecked={false} /><span className="slider"></span></label>
            </div>
        </div>
        </div>
    );

    const WalletSettings = () => (
        <div className="settings-wallet">
        <div className="wallet-card">
            <div className="wallet-icon-wrapper">
                <img src={walletLargeIcon} alt="wallet" className="wallet-card-icon" />
            </div>
            <div className="wallet-info">
                <span className="wallet-label">Мій баланс</span>
                <span className="wallet-amount">{parseFloat(balance || 0).toFixed(2)}₴</span> 
            </div>
        </div>
        
        <div className="wallet-topup-section">
            <label>Поповнення балансу</label>
            <div className="topup-controls">
            <input 
                type="number" 
                placeholder="Сума" 
                value={topupAmount} 
                onChange={e => setTopupAmount(e.target.value)} 
            />
            <button className="btn-save" onClick={handleTopup}>Поповнити</button>
            </div>
            {topupMessage && <p className="success-msg">{topupMessage}</p>}
        </div>

        <h3 className="history-title">Історія транзакцій</h3>
        <div className="history-table">
            <div className="history-header">
            <span>Сума</span>
            <span>Найменування</span>
            <span>Дата</span>
            </div>
            <div className="history-row"><span className="red">-1000₴</span><span>Якась гра, яка дуже всім сподобається</span><span>02.02.2023</span></div>
            <div className="history-row"><span className="green">+1000.50₴</span><span>Поповнення балансу</span><span>02.02.2023</span></div>
            <div className="history-row"><span className="green">+100.50₴</span><span>Поповнення балансу</span><span>02.02.2023</span></div>
            <div className="history-row"><span className="red">-1000₴</span><span>Якась гра, яка дуже всім сподобається</span><span>02.02.2023</span></div>
        </div>
        </div>
    );

    const DeleteSettings = () => (
        <div className="settings-panel small-panel">
        <h2 className="panel-title">Видалення акаунта</h2>
        <div className="warning-box">
            Натисніть <strong>видалити мій акаунт</strong>, щоб розпочати процес остаточного видалення вашого акаунта, включно з усією особистою інформацією та купленим контентом. Після видалення вашого акаунта баланс вашого гаманця також буде безповоротно видалено.
        </div>
        <div className="settings-form">
            <div className="settings-input-group">
            <label>Нікнейм</label>
            <input type="text" placeholder="Введіть ваш поточний нікнейм..." />
            </div>
            <div className="settings-input-group">
            <label>Пароль</label>
            <input type="password" placeholder="Введіть ваш поточний пароль..." />
            <input type="password" placeholder="Повторіть пароль..." style={{ marginTop: '10px' }} />
            </div>
            <div className="settings-actions center">
            <button className="btn-delete">Видалити мій акаунт</button>
            </div>
        </div>
        </div>
    );

    return (
        <div className="settings-page-wrapper">
            <div className="settings-container">
            
                <div className="settings-sidebar">
                    <div className="sidebar-search">
                        <input type="text" placeholder="Пошук налаштувань..." />
                    </div>
                
                    <div className="sidebar-menu">
                        <div className="sidebar-item no-hover">
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <img src={themeIcon} alt="theme" className="sidebar-icon" /> Темна тема
                        </div>
                        <label className="toggle-switch theme-toggle">
                            <input type="checkbox" checked={isDarkTheme} onChange={() => setIsDarkTheme(!isDarkTheme)} />
                            <span className="slider"></span>
                        </label>
                        </div>

                        <div className={`sidebar-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                            <img src={generalIcon} alt="general" className="sidebar-icon" /> Загальні налаштування
                        </div>

                        <div className={`sidebar-item ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                            <img src={passwordIcon} alt="password" className="sidebar-icon" /> Пароль
                        </div>
                        
                        <div className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                            <img src={notificationIcon} alt="notifications" className="sidebar-icon" /> Сповіщення
                        </div>

                        <div className={`sidebar-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
                            <img src={walletIcon} alt="wallet" className="sidebar-icon" /> Гаманець
                        </div>
                        
                        <div className={`sidebar-item ${activeTab === 'delete' ? 'active' : ''}`} onClick={() => setActiveTab('delete')}>
                            <img src={deleteIcon} alt="delete" className="sidebar-icon" /> Видалення акаунта
                        </div>
                    </div>
                </div>

                <div className="settings-content">
                    {activeTab === 'general' && <GeneralSettings />}
                    {activeTab === 'password' && <PasswordSettings />}
                    {activeTab === 'notifications' && <NotificationSettings />}
                    {activeTab === 'wallet' && <WalletSettings />}
                    {activeTab === 'delete' && <DeleteSettings />}
                </div>
            </div>
        </div>
    );
}