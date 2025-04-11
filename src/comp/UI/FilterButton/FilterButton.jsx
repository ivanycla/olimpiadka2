export default function FilterButton({children, onClick, isActive}){
    return (
        <button className={isActive ? 'active' : ''} onClick={onClick}>{children}</button>
    )
}