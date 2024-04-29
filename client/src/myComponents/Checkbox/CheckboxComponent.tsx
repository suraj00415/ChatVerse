import './stylesCheck.css'
export default function CheckboxComponent({ checkHandler }) {
    return (
        <>
            <label className="container2">
                <input type="checkbox" checked={checkHandler} />
                <span className="checkmark"></span>
            </label>
        </>
    )
}