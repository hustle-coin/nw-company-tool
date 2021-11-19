import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Permission, User, UserWithPermissions } from '@nw-company-tool/model';
import { AdminService } from '../../../../services/admin/admin.service';
import { UserService } from '../../../../services/user/user.service';
import { SnackbarService } from '../../../../services/snackbar/snackbar.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.css']
})
export class UsersTableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'characterName', 'discordUsername', 'discordId', 'enabled', 'admin'];

  displayedData: UserWithPermissions[] = [];
  data: UserWithPermissions[] = [];

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.adminService.findAll().subscribe((data) => {
      this.data = data;
      this.displayedData = data;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedData = this.data.filter((user) => user.characterName.toLowerCase().startsWith(filterValue));
  }

  getUserId(): Observable<number> {
    return this.userService.getUser$().pipe(map((user) => user.id));
  }

  async enable(change: MatSlideToggleChange, user: User): Promise<void> {
    await this.userService
      .getUser$()
      .pipe(
        map((currentUser) => {
          //dont disable yourself ;)
          if (currentUser.id === user.id) {
            return;
          }
          this.adminService
            .setEnabled(user.id, change.checked)
            .subscribe(() => this.snackbarService.open(`User enabled: ${change.checked}`));
        })
      )
      .toPromise();
  }

  async admin(change: MatSlideToggleChange, user: User): Promise<void> {
    await this.userService
      .getUser$()
      .pipe(
        map((currentUser) => {
          //dont disable yourself ;)
          if (currentUser.id === user.id) {
            return;
          }
          this.adminService
            .setAdmin(user.id, change.checked)
            .subscribe(() => this.snackbarService.open(`User admin: ${change.checked}`));
        })
      )
      .toPromise();
  }

  isEnabled(user: UserWithPermissions): boolean {
    return !!user?.permissions?.includes(Permission.ENABLED);
  }

  isAdmin(user: UserWithPermissions): boolean {
    return !!user?.permissions?.includes(Permission.ADMIN);
  }
}
