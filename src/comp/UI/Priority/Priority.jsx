
import React from "react";
import styles from "./Priority.module.css";

const Priority = ({ cardId, selectedPriority, onPriorityChange }) => {
    const handleChange = (value) => {
        if (typeof onPriorityChange === 'function') {
          onPriorityChange(cardId, value);
        }
      };
  return (
    <div className={styles.checkboxContainer}>
      {[...Array(10)].map((_, index) => {
        const value = index + 1;
        return (
          <label className={styles.styledLabel} key={value}>
            <input
              type="radio"
              name={`priority-${cardId}`}
              value={value}
              checked={selectedPriority === value}
              onChange={() => handleChange(value)}
            />
            <span className={styles.customCheckbox}>{value}</span>
          </label>
        );
      })}
    </div>
  );
};

export default Priority;