// FindFriend.js
import React, { useState, useEffect } from "react";

const FindFriend = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [addedFriends, setAddedFriends] = useState([]);
    const [mockFriends] = useState([
        "чмо",
        "шлюза",
        "матье бал",
        "залупенька",
        "лазовский"
    ]);

   
    useEffect(() => {
        const savedFriends = JSON.parse(localStorage.getItem("friends")) || [];
        setAddedFriends(savedFriends);
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const results = mockFriends.filter(friend =>
                friend.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFriends(results);
        } else {
            setFilteredFriends([]);
        }
    }, [searchTerm, mockFriends]);

    const handleAddFriend = (friend) => {
        if (!addedFriends.includes(friend)) {
            const newFriends = [...addedFriends, friend];
            setAddedFriends(newFriends);
            localStorage.setItem("friends", JSON.stringify(newFriends));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Поиск друзей</h2>
            <input
                type="text"
                placeholder="Введите имя друга..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '20px',
                    fontSize: '16px'
                }}
            />
            
            <div>
                {searchTerm && (
                    filteredFriends.length === 0 ? (
                        <p>Ничего не найдено</p>
                    ) : (
                        filteredFriends.map((friend, index) => (
                            <div 
                                key={index}
                                style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #ccc',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{friend}</span>
                                <button
                                    onClick={() => handleAddFriend(friend)}
                                    disabled={addedFriends.includes(friend)}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: addedFriends.includes(friend) ? '#ccc' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {addedFriends.includes(friend) ? 'Добавлено' : 'Добавить'}
                                </button>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default FindFriend;