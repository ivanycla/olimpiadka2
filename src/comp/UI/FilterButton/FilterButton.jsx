import styles from './FilterButton.module.css'

export default function FilterButton({children, onClick, isActive}){
    return (
        <button className={isActive ? styles.active : styles.filterButton} onClick={onClick}>{children}</button>
    )
}