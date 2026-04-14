import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css'
})
export class PaginatorComponent implements OnChanges {

  @Input() pagination: any;
  @Input() pagedRoute = '/admin/user/paged';
  @Input() routeName?: string;
  pages: number[] = [];
  desde: number;
  hasta: number;
  rangeStart = 0;
  rangeEnd = 0;
  totalElements = 0;
  pageSize = 0;
  routeBase = '/admin/user/paged';

  ngOnInit(): void {
    this.initPagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const paginationChange = changes["pagination"];
    if (changes["pagedRoute"] || changes["routeName"]) {
      this.routeBase = this.buildRouteBase();
    }
    if (paginationChange && paginationChange.currentValue) {
      this.initPagination();
    }
  }

  private buildRouteBase(): string {
    const rawRoute = (this.routeName && this.routeName.trim().length > 0)
      ? this.routeName.trim()
      : this.pagedRoute;

    if (!rawRoute) {
      return '/admin/user/paged';
    }

    if (rawRoute.startsWith('/')) {
      return rawRoute.replace(/\/+$/, '');
    }

    if (rawRoute.startsWith('admin/')) {
      return `/${rawRoute.replace(/\/+$/, '')}`;
    }

    return `/admin/${rawRoute.replace(/\/+$/, '')}`;
  }

  getPageLink(page: number): string[] {
    return [this.routeBase, String(page)];
  }

  private initPagination() {
    if (!this.pagination || this.pagination.totalPages === 0) {
      this.pages = [];
      this.rangeStart = 0;
      this.rangeEnd = 0;
      this.totalElements = 0;
      this.pageSize = 0;
      return;
    }

    const totalPages = (this.pagination.totalPages as number) ?? 0;
    const current = (this.pagination.number as number) ?? 0;
    const size = (this.pagination.size ?? this.pagination.pageable?.pageSize ?? this.pagination.pageSize ?? 0) as number;
    const totalEl = (this.pagination.totalElements ?? this.pagination.total ?? 0) as number;
    const numberOfElements = (this.pagination.numberOfElements ?? Math.min(size, Math.max(0, totalEl - current * size))) as number;

    let start = Math.max(0, current - 2);
    let end = Math.min(totalPages - 1, start + 4);
    start = Math.max(0, Math.min(start, end - 4));
    this.pages = [];
    for (let p = start; p <= end; p++) {
      this.pages.push(p);
    }

    this.pageSize = size;
    this.totalElements = totalEl;
    if (totalEl === 0 || size === 0) {
      this.rangeStart = 0;
      this.rangeEnd = 0;
    } else {
      this.rangeStart = current * size + (numberOfElements > 0 ? 1 : 0);
      this.rangeEnd = current * size + numberOfElements;
    }
  }

}
