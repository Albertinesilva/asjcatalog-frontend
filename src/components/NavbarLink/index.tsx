import Link from "next/link";
import { NavLinkProps } from "../../@types";
import { returnSelect } from "../../utils";

export default function NavbarLink({ target, label }: NavLinkProps) {
  return (
    <Link href={target} className={returnSelect(target)}>
      {label}
    </Link>
  );
}
