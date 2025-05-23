function Button({onClick, className, isDisabled = false, children}) {

    return (
        <button onClick={onClick} className = {className} disabled={isDisabled}>
            {children}
        </button>
    );
}

export default Button;