from getpass import getpass

from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.services.security import hash_password


MIN_ADMIN_PASSWORD_LENGTH = 12


def read_admin_data() -> UserCreate:
    name = input("Nome do administrador: ").strip()
    email = input("E-mail: ").strip().lower()

    password = getpass("Senha: ")
    password_confirmation = getpass("Confirme a senha: ")

    if password != password_confirmation:
        raise ValueError("As senhas informadas não coincidem.")

    if len(password) < MIN_ADMIN_PASSWORD_LENGTH:
        raise ValueError(
            "A senha do administrador deve ter pelo menos "
            f"{MIN_ADMIN_PASSWORD_LENGTH} caracteres."
        )

    return UserCreate(
        name=name,
        email=email,
        password=password,
    )


def create_first_admin() -> None:
    admin_data = read_admin_data()

    with SessionLocal() as db:
        existing_admin = (
            db.query(User.id)
            .filter(User.role == UserRole.ADMIN)
            .first()
        )

        if existing_admin:
            raise RuntimeError(
                "Já existe um administrador cadastrado. "
                "O script de bootstrap não pode ser executado novamente."
            )

        normalized_email = str(admin_data.email).lower()

        existing_user = (
            db.query(User.id)
            .filter(func.lower(User.email) == normalized_email)
            .first()
        )

        if existing_user:
            raise RuntimeError(
                "Já existe um usuário cadastrado com esse e-mail."
            )

        confirmation = input(
            "\nCriar o primeiro administrador? [s/N]: "
        ).strip().lower()

        if confirmation not in {"s", "sim"}:
            print("Criação cancelada.")
            return

        admin = User(
            name=admin_data.name.strip(),
            email=normalized_email,
            password_hash=hash_password(admin_data.password),
            role=UserRole.ADMIN,
        )

        try:
            db.add(admin)
            db.commit()
            db.refresh(admin)
        except SQLAlchemyError:
            db.rollback()
            raise

        print("\nAdministrador criado com sucesso.")
        print(f"ID: {admin.id}")
        print(f"Nome: {admin.name}")
        print(f"E-mail: {admin.email}")
        print(f"Perfil: {admin.role.value}")


def main() -> None:
    try:
        create_first_admin()
    except ValidationError as error:
        print("\nOs dados informados são inválidos.")

        for validation_error in error.errors():
            field = ".".join(
                str(location) for location in validation_error["loc"]
            )
            message = validation_error["msg"]

            print(f"- {field}: {message}")

        raise SystemExit(1) from error
    except (ValueError, RuntimeError) as error:
        print(f"\nNão foi possível criar o administrador: {error}")
        raise SystemExit(1) from error
    except SQLAlchemyError as error:
        print(
            "\nNão foi possível acessar o banco de dados "
            "ou salvar o administrador."
        )
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()