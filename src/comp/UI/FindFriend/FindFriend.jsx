import React, { useState, useEffect } from "react";

const FindFriend = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [addedFriends, setAddedFriends] = useState([]);
    
    const [friends] = useState([
        "чмо",
        "шлюза",
        "матье бал",
        "залупенька",
        "лазовский"
    ]);

    useEffect(() => {
        if (searchTerm) {
            const results = friends.filter(friend =>
                friend.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFriends(results);
        } else {
            setFilteredFriends([]);
        }
    }, [searchTerm, friends]);

    const handleAddFriend = (friend) => {
        if (!addedFriends.includes(friend)) {
            setAddedFriends([...addedFriends, friend]);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Поиск друзей с сервера массив и в локалке сторить будем</h2>
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