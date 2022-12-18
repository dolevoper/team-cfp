type IconNames = "ChevronDown";

export default function Icon({ iconName }: { iconName: IconNames }) {
    return <i className={`ms-Icon ms-Icon--${iconName}`} data-icon />
}
